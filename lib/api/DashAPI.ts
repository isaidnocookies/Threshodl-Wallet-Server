import { CryptoAPI, Network } from "./CryptoAPI";
import { Config } from "../config/config";
import { resolve } from "../../node_modules/@types/bluebird";


class DashAPI extends CryptoAPI {
    
    coin: string = "BTC";
    network: Network;
    dashcore: any = require('dashcore-lib');
    config : any = new Config();

    createWallet(chainType : Network, seed : string) {
        var newPrivateKey: any;
        var newWif: string;
        var newAddress: string;
        var fromSeed: boolean;
        var network: any;
        var success: boolean = true;

        if (chainType == Network.Mainnet) {
            network = this.dashcore.Networks.Mainnet;
        } else if (chainType == Network.Testnet) {
            network = this.dashcore.Networks.Testnet;
        } else if (chainType == Network.Regtest) {
            network = this.dashcore.Networks.Regtest;
        } else {
            success = false;
        }

        if(seed && success) {
            var theSeedValue = Buffer.from(seed)
            var hash = this.dashcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.dashcore.crypto.BN.fromBuffer(hash);

            newPrivateKey = new this.dashcore.PrivateKey(bn);
            fromSeed = true;
        } else if (success) {
            newPrivateKey = new this.dashcore.PrivateKey.fromRandom(network);
            fromSeed = false;
        }

        if (success) {
            newWif = newPrivateKey.toWIF();
            newAddress = newPrivateKey.toAddress(this.dashcore.Networks.testnet).toString();
        }

        if (!newPrivateKey || !newWif || !newAddress) {
            newPrivateKey = "";
            newWif = "";
            newAddress = "";
            fromSeed = false;
        }

        this.dashcore = null;
        return ({"address" : newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed});
    }

    getBalance(chainType: Network, address : string) {

        var insightUrl : string;
        if (chainType == 1) {
            insightUrl = this.config.insightServers.dash.main;
        } else {
            insightUrl = this.config.insightServers.dash.testnet;
        }

        const axios = require('axios');
        return axios({
            method:'get',
            url:insightUrl + '/addr/' + address,
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
            insightUrl = this.config.insightServers.dash.main;
        } else {
            insightUrl = this.config.insightServers.dash.testnet;
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
            insightUrl = this.config.insightServers.dash.main;
        } else {
            insightUrl = this.config.insightServers.dash.testnet;
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

    createTransactionHex(chainType: Network, fromAddress: string, fromPrivateKey: string, toAddresses: string[], toAmounts: string[], message: string) {
        var total = toAmounts[0];

        return this.getUnspentTransactions(chainType, fromAddress, String(total)).then(utxos => {
            if (utxos) {
                if (!fromPrivateKey || toAddresses.length <= 0 || toAddresses.length != toAmounts.length) {
                    throw new Error(`${this.coin} - Error with send parameters.`);
                }

                var lUtxos : any[] = [];
                for (var i = 0; i < utxos.length; i++) {
                    var utxoIn : any = {
                        "txId" : utxos[i].txid,
                        "outputIndex" : utxos[i].vout,
                        "address" : utxos[i].address,
                        "script" : utxos[i].scriptPubKey,
                        "satoshis" : utxos[i].satoshis
                    };
                    lUtxos[i] = utxoIn;
                }

                try {
                    var transaction = new this.dashcore.Transaction().from(lUtxos);
                    var privateKey = new this.dashcore.PrivateKey(fromPrivateKey);
                } catch {
                    throw new Error(`${this.coin} - Error creating private key and transaction.`);
                }
                
                for (var i = 0; i < toAddresses.length; i++) {
                    let inAmount : number = Math.trunc(parseFloat(toAmounts[i]) / 0.00000001);
                    transaction.to(toAddresses[i], inAmount);
                }
                
                try {
                    transaction.change(fromAddress);
                    transaction.fee(10000);
                    transaction.addData(message);
                    transaction.sign(privateKey);
                } catch {
                    throw new Error(`${this.coin} - Error signing raw transaction.`);
                }

                var txHex : string = transaction.toString();
                return txHex;
            } else {
                throw new Error(`${this.coin} - Error creating raw transaction.`);
            }
        });
    }

    sendTransactionHex(chainType: Network, txHex : string) {
        const axios = require('axios');

        var insightUrl : string;
        var nodeUrl : string;

        if (chainType == 1) {
            insightUrl = this.config.insightServers.dash.main;
            nodeUrl = this.config.nodes.dash.main;
        } else {
            insightUrl = this.config.insightServers.dash.testnet;
            nodeUrl = this.config.nodes.dash.testnet;
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
    }

    send(chainType: Network, fromAddress: string, fromPrivateKey: string, toAddresses: string[], toAmounts: string[]) {
        const axios = require('axios');
        var total = toAmounts[0];

        var insightUrl : string;
        var nodeUrl : string;

        if (chainType == 1) {
            insightUrl = this.config.insightServers.dash.main;
            nodeUrl = this.config.nodes.dash.main;
        } else {
            insightUrl = this.config.insightServers.dash.testnet;
            nodeUrl = this.config.nodes.dash.testnet;
        }

        return this.getUnspentTransactions(chainType, fromAddress, String(total)).then(utxos => {
            if (utxos) {
                if (!fromPrivateKey || toAddresses.length <= 0 || toAddresses.length != toAmounts.length) {
                    throw new Error(`${this.coin} - Error with send parameters.`);
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

                try {
                    var transaction = new this.dashcore.Transaction().from(lUtxos);
                    var privateKey = new this.dashcore.PrivateKey(fromPrivateKey);
                } catch {
                    throw new Error(`${this.coin} - Error creating private key and transaction.`);
                }
                
                for (var i = 0; i < toAddresses.length; i++) {
                    let inAmount : number = Math.trunc(parseFloat(toAmounts[i]) / 0.00000001);
                    transaction.to(toAddresses[i], inAmount);
                }
                
                try {
                    transaction.change(fromAddress);
                    transaction.fee(10000);
                    transaction.sign(privateKey);
                } catch {
                    throw new Error(`${this.coin} - Error signing raw transaction.`);
                }

                var txHex : string = transaction.toString();
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
                throw new Error(`${this.coin} - Error sending raw transaction.`);
            }
        });
    }
}

export { DashAPI, Network };