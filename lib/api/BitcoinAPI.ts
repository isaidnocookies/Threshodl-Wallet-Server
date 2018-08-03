import { CryptoAPI, Network } from "./CryptoAPI";
import { Config } from "../config/config";
import { resolve } from "../../node_modules/@types/bluebird";

class BitcoinAPI extends CryptoAPI {
    
    coin: string = "BTC";
    network: Network;
    bitcoreMnemonic: any = require('bitcore-mnemonic');
    bitcore: any = this.bitcoreMnemonic.bitcore;
    config : any = new Config();

    createWallet(chainType : Network, seed : string) {
        var newPrivateKey: any;
        var newWif: string;
        var newAddress: string;
        var fromSeed: boolean;
        var network: any;
        var success: boolean = true;

        if (chainType == Network.Mainnet) {
            network = this.bitcore.Networks.Mainnet;
        } else if (chainType == Network.Testnet) {
            network = this.bitcore.Networks.Testnet;
        } else if (chainType == Network.Regtest) {
            network = this.bitcore.Networks.Regtest;
        } else {
            success = false;
        }

        if(seed && success) {
            var theSeedValue = Buffer.from(seed)
            var hash = this.bitcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.bitcore.crypto.BN.fromBuffer(hash);

            newPrivateKey = new this.bitcore.PrivateKey(bn);
            fromSeed = true;
        } else if (success) {
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
        return ({"address" : newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed});
    }

    getBalance(chainType: Network, address : string) {
        const axios = require('axios');
        return axios({
            method:'get',
            url:this.config.insightServers.btc.host + '/addr/' + address,
            responseType:'application/json'
        }).then(function(response) {
            return ({"confirmed" : response.data.balance, "unconfirmed": response.data.unconfirmedBalance});
        }).catch(error => {
            return ({"confirmed" : "-1", "unconfirmed" : "-1" });
        });
    }

    getUnspentTransactions(chainType : Network, address : string, amount : string) {
        return this.getUnspentTransactionsInternal(chainType, address, amount, 3);
    }

    getUnspentTransactionsInternal(chainType : Network, address : string, amount : string, attempts : number) {
        const axios = require('axios');
        var insightUrl : string;

        if (chainType == 1) {
            insightUrl = this.config.insightServers.btc.main;
        } else {
            insightUrl = this.config.insightServers.btc.testnet;
        }

        return axios({
            method:'get',
            url:insightUrl + '/addr/' + address + "/utxo",
            responseType:'application/json'
        }).then(function(response) {
            return response.data;
        }).catch(error => {
            if (attempts > 0){
                return this.getUnspentTransactionsInternal(chainType, address, amount, --attempts);
            }
            return null;
        });
    }

    getTransactionFee(chainType: Network, inputs: number, outputs: number): any {
        const axios = require('axios');

        var insightUrl : string;
        if (chainType == 1) {
            insightUrl = this.config.insightServers.btc.main;
        } else {
            insightUrl = this.config.insightServers.btc.testnet;
        }

        return axios({
            method:'get',
            url:insightUrl + "/utils/estimatefee?nbBlocks=2",
            responseType:'application/json'
        }).then(function(response) {
            return "0.0001";
        }).catch(error => {
            console.log(error);
            return "-1";
        });
    }

    send(chainType: Network, fromAddress: string, fromPrivateKey: string, toAddresses: string[], toAmounts: string[]) {
        const axios = require('axios');
        var total = toAmounts[0];

        var insightUrl : string;
        if (chainType == 1) {
            insightUrl = this.config.insightServers.btc.main;
        } else {
            insightUrl = this.config.insightServers.btc.testnet;
        }

        return this.getUnspentTransactions(chainType, fromAddress, String(total)).then(utxos => {
            if (utxos) {
                if (!fromPrivateKey || toAddresses.length <= 0 || toAddresses.length != toAmounts.length) {
                    return ("-1");
                }

                var lUtxos : any[] = [];
                for (var i = 0; i < utxos.length; i++) {
                    var utxoIn = {
                        "txId" : utxos[i].txid,
                        "outputIndex" : utxos[i].vout,
                        "address" : utxos[i].address,
                        "script" : utxos[i].scriptPubKey,
                        "satoshis" : utxos[i].satoshis
                    };
                    lUtxos[i] = utxoIn;
                }

                var transaction = new this.bitcore.Transaction().from(lUtxos);
                var privateKey = new this.bitcore.PrivateKey(fromPrivateKey);
                
                for (var i = 0; i < toAddresses.length; i++) {
                    let inAmount : number = Math.trunc(parseFloat(toAmounts[i]) / 0.00000001);
                    transaction.to(toAddresses[i], inAmount);
                }
                
                transaction.change(fromAddress);
                transaction.fee(10000);
                transaction.sign(privateKey);

                var txHex : string = transaction.toString();
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
                    } else {
                      let message = {
                        message: `Error sending raw transaction: ${this.coin.toUpperCase()} .`,
                        data: response,
                      };
                      throw new Error(`${this.coin} - Error sending raw transaction. Error  ${JSON.stringify(message)}`);
                    }
                  }).catch(error => {
                    throw new Error(`${this.coin} - Error sending raw transaction.`);
                  });
            } else {
                return ("-2");
            }
        });
    }
}

export { BitcoinAPI, Network };