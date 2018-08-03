"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoAPI_1 = require("./CryptoAPI");
exports.Network = CryptoAPI_1.Network;
const config_1 = require("../config/config");
class BitcoinAPI extends CryptoAPI_1.CryptoAPI {
    constructor() {
        super(...arguments);
        this.coin = "BTC";
        this.bitcoreMnemonic = require('bitcore-mnemonic');
        this.bitcore = this.bitcoreMnemonic.bitcore;
        this.config = new config_1.Config();
    }
    createWallet(chainType, seed) {
        var newPrivateKey;
        var newWif;
        var newAddress;
        var fromSeed;
        var network;
        var success = true;
        if (chainType == CryptoAPI_1.Network.Mainnet) {
            network = this.bitcore.Networks.Mainnet;
        }
        else if (chainType == CryptoAPI_1.Network.Testnet) {
            network = this.bitcore.Networks.Testnet;
        }
        else if (chainType == CryptoAPI_1.Network.Regtest) {
            network = this.bitcore.Networks.Regtest;
        }
        else {
            success = false;
        }
        if (seed && success) {
            var theSeedValue = Buffer.from(seed);
            var hash = this.bitcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.bitcore.crypto.BN.fromBuffer(hash);
            newPrivateKey = new this.bitcore.PrivateKey(bn);
            fromSeed = true;
        }
        else if (success) {
            newPrivateKey = new this.bitcore.PrivateKey.fromRandom(network);
            fromSeed = false;
        }
        if (success) {
            newWif = newPrivateKey.toWIF();
            newAddress = newPrivateKey.toAddress(this.bitcore.Networks.testnet).toString();
        }
        if (!newPrivateKey || !newWif || !newAddress) {
            newPrivateKey = "";
            newWif = "";
            newAddress = "";
            fromSeed = false;
        }
        this.bitcore = null;
        return ({ "address": newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed });
    }
    getBalance(chainType, address) {
        const axios = require('axios');
        return axios({
            method: 'get',
            url: this.config.insightServers.btc.host + '/addr/' + address,
            responseType: 'application/json'
        }).then(function (response) {
            return ({ "confirmed": response.data.balance, "unconfirmed": response.data.unconfirmedBalance });
        }).catch(error => {
            return ({ "confirmed": "-1", "unconfirmed": "-1" });
        });
    }
    getUnspentTransactions(chainType, address, amount) {
        return this.getUnspentTransactionsInternal(chainType, address, amount, 3);
    }
    getUnspentTransactionsInternal(chainType, address, amount, attempts) {
        const axios = require('axios');
        var insightUrl;
        if (chainType == 1) {
            insightUrl = this.config.insightServers.btc.main;
        }
        else {
            insightUrl = this.config.insightServers.btc.testnet;
        }
        return axios({
            method: 'get',
            url: insightUrl + '/addr/' + address + "/utxo",
            responseType: 'application/json'
        }).then(function (response) {
            return response.data;
        }).catch(error => {
            if (attempts > 0) {
                return this.getUnspentTransactionsInternal(chainType, address, amount, --attempts);
            }
            return null;
        });
    }
    getTransactionFee(chainType, inputs, outputs) {
        const axios = require('axios');
        var insightUrl;
        if (chainType == 1) {
            insightUrl = this.config.insightServers.btc.main;
        }
        else {
            insightUrl = this.config.insightServers.btc.testnet;
        }
        return axios({
            method: 'get',
            url: insightUrl + "/utils/estimatefee?nbBlocks=2",
            responseType: 'application/json'
        }).then(function (response) {
            return "0.0001";
            // TODO :
            // let feeRate : number = response.body["2"];
            // if (feeRate) {
            //     let fee : number = (feeRate / 1000) * ((inputs * 180) + (outputs * 34) + (10 + outputs));
            //     return String(fee);
            // }
            // return "-1";
        }).catch(error => {
            console.log(error);
            return "-1";
        });
    }
    send(chainType, fromAddress, fromPrivateKey, toAddresses, toAmounts) {
        const axios = require('axios');
        var total = toAmounts[0];
        var insightUrl;
        if (chainType == 1) {
            insightUrl = this.config.insightServers.btc.main;
        }
        else {
            insightUrl = this.config.insightServers.btc.testnet;
        }
        return this.getUnspentTransactions(chainType, fromAddress, String(total)).then(utxos => {
            if (utxos) {
                if (!fromPrivateKey || toAddresses.length <= 0 || toAddresses.length != toAmounts.length) {
                    return ("-1");
                }
                var lUtxos = [];
                for (var i = 0; i < utxos.length; i++) {
                    var utxoIn = {
                        "txId": utxos[i].txid,
                        "outputIndex": utxos[i].vout,
                        "address": utxos[i].address,
                        "script": utxos[i].scriptPubKey,
                        "satoshis": utxos[i].satoshis
                    };
                    lUtxos[i] = utxoIn;
                }
                var transaction = new this.bitcore.Transaction().from(lUtxos);
                var privateKey = new this.bitcore.PrivateKey(fromPrivateKey);
                for (var i = 0; i < toAddresses.length; i++) {
                    let inAmount = Math.trunc(parseFloat(toAmounts[i]) / 0.00000001);
                    transaction.to(toAddresses[i], inAmount);
                }
                transaction.change(fromAddress);
                transaction.fee(10000);
                transaction.sign(privateKey);
                var txHex = transaction.toString();
                // send transaction
                return axios({
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: this.config.nodes.btc.host,
                    data: {
                        method: 'sendrawtransaction',
                        'params': [txHex]
                    }
                }).then(response => {
                    if (response.data.result && response.data.result.error == null) {
                        return response.data.result;
                    }
                    else {
                        let message = {
                            message: `Error sending raw transaction: ${this.coin.toUpperCase()} .`,
                            data: response,
                        };
                        throw new Error(`${this.coin} - Error sending raw transaction. Error  ${JSON.stringify(message)}`);
                    }
                }).catch(error => {
                    throw new Error(`${this.coin} - Error sending raw transaction.`);
                });
            }
            else {
                return ("-2");
            }
        });
    }
}
exports.BitcoinAPI = BitcoinAPI;
//# sourceMappingURL=BitcoinAPI.js.map