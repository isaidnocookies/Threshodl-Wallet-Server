"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            network = this.bitcore.Networks.livenet;
        }
        else if (chainType == CryptoAPI_1.Network.Testnet) {
            network = this.bitcore.Networks.testnet;
        }
        else {
            success = false;
        }
        if (seed && success) {
            var theSeedValue = Buffer.from(seed);
            var hash = this.bitcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.bitcore.crypto.BN.fromBuffer(hash);
            newPrivateKey = new this.bitcore.PrivateKey(bn, network);
            fromSeed = true;
        }
        else if (success) {
            newPrivateKey = new this.bitcore.PrivateKey.fromRandom(network);
            fromSeed = false;
        }
        if (success) {
            newWif = newPrivateKey.toWIF();
            newAddress = newPrivateKey.toAddress(network).toString();
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
        var insightUrl;
        if (chainType == 1) {
            insightUrl = this.config.insightServers.btc.main;
        }
        else {
            insightUrl = this.config.insightServers.btc.testnet;
        }
        const axios = require('axios');
        return axios({
            method: 'get',
            url: insightUrl + '/addr/' + address,
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
            console.log("Error - Get upspent transactions internal failed...");
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
        }).catch(error => {
            console.log(error);
            return "-1";
        });
    }
    createTransactionHex(chainType, fromAddress, fromPrivateKey, toAddresses, toAmounts, message) {
        return __awaiter(this, void 0, void 0, function* () {
            var total = 0.0;
            for (var i = 0; i < toAmounts.length; i++) {
                total = total + (parseFloat(toAmounts[i]) / 0.00000001);
            }
            var feeEstimate = yield this.getTransactionFee(chainType, 2, 2);
            return this.getUnspentTransactions(chainType, fromAddress, String(total)).then(utxos => {
                if (utxos) {
                    if (!fromPrivateKey || toAddresses.length <= 0 || toAddresses.length != toAmounts.length) {
                        throw new Error(`${this.coin} - Error with send parameters.`);
                    }
                    var utxoTotal = 0;
                    var lUtxos = [];
                    for (var i = 0; i < utxos.length; i++) {
                        var utxoIn = {
                            "txId": utxos[i].txid,
                            "outputIndex": utxos[i].vout,
                            "address": utxos[i].address,
                            "script": utxos[i].scriptPubKey,
                            "satoshis": utxos[i].satoshis
                        };
                        utxoTotal = utxoTotal + parseFloat(utxos[i]);
                        lUtxos[i] = utxoIn;
                        if (utxoTotal > total + parseFloat(feeEstimate)) {
                            break;
                        }
                    }
                    try {
                        var transaction = new this.bitcore.Transaction().from(lUtxos);
                        var privateKey = new this.bitcore.PrivateKey(fromPrivateKey);
                    }
                    catch (_a) {
                        throw new Error(`${this.coin} - Error creating private key and transaction.`);
                    }
                    console.log(" about to create transaction");
                    for (var i = 0; i < toAddresses.length; i++) {
                        let inAmount = Math.trunc(parseFloat(toAmounts[i]) / 0.00000001);
                        transaction.to(toAddresses[i], inAmount);
                    }
                    return this.getTransactionFee(chainType, lUtxos.length, toAddresses.length).then(lfee => {
                        var lTxFee = String(parseFloat(lfee) / 0.00000001);
                        if (parseFloat(lfee) + total > utxoTotal) {
                            if ((utxoTotal - total) > 0 && ((utxoTotal - total) < parseFloat(lfee))) {
                                lTxFee = String(utxoTotal - total);
                            }
                            else {
                                throw new Error(`${this.coin} - Not enough to cover fees in transaction creation.`);
                            }
                        }
                        try {
                            transaction.change(fromAddress);
                            transaction.fee(parseFloat(lTxFee));
                            if (message !== "") {
                                console.log(`Adding transaction message -- ${this.coin}`);
                                transaction.addData(message);
                            }
                            transaction.sign(privateKey);
                        }
                        catch (_a) {
                            throw new Error(`${this.coin} - Error signing raw transaction.`);
                        }
                        var txHex = transaction.toString();
                        return ({ "txHex": txHex, "fee": lfee });
                    });
                }
                else {
                    throw new Error(`${this.coin} - Error creating raw transaction.`);
                }
            });
        });
    }
    sendTransactionHex(chainType, txHex) {
        const axios = require('axios');
        // var insightUrl : string;
        var nodeUrl;
        if (chainType == 1) {
            // insightUrl = this.config.insightServers.btc.main;
            nodeUrl = this.config.nodes.btc.main;
        }
        else {
            // insightUrl = this.config.insightServers.btc.testnet;
            nodeUrl = this.config.nodes.btc.testnet;
        }
        return axios({
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            url: nodeUrl,
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
    send(chainType, fromAddress, fromPrivateKey, toAddresses, toAmounts) {
        return this.createTransactionHex(chainType, fromAddress, fromPrivateKey, toAddresses, toAmounts, "").then(txhex => {
            return this.sendTransactionHex(chainType, txhex).then(txid => {
                return txid;
            }).catch(error => {
                throw new Error(`${this.coin} - Error sending raw transaction.`);
            });
        }).catch(error => {
            throw new Error(`${this.coin} - Error creating raw transaction.`);
        });
    }
}
exports.BitcoinAPI = BitcoinAPI;
//# sourceMappingURL=BitcoinAPI.js.map