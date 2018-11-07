import { CryptoAPI, Network } from "./CryptoAPI";
import { Config } from "../config/config";

class DashAPI extends CryptoAPI {
        
    coin: string = "DASH";
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
            network = this.dashcore.Networks.livenet;
        } else if (chainType == Network.Testnet) {
            network = this.dashcore.Networks.testnet;
        } else {
            success = false;
        }

        if(seed && success) {
            var theSeedValue = Buffer.from(seed)
            var hash = this.dashcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.dashcore.crypto.BN.fromBuffer(hash);

            newPrivateKey = new this.dashcore.PrivateKey(bn,network);
            fromSeed = true;
        } else if (success) {
            newPrivateKey = new this.dashcore.PrivateKey.fromRandom(network);
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

    async createTransactionHex(chainType: Network, fromAddresses: string[], fromPrivateKeys: string[], toAddresses: string[], toAmounts: string[], returnAddress : string, fee : string, message: string) {
        var total : number = 0.0;

        for (var i = 0; i < toAmounts.length; i++) {
            total = total + (parseFloat(toAmounts[i]) / 0.00000001);
        }

        var feeEstimate : string = await this.getTransactionFee(chainType, 2, 2);

        // TEMPORARY UNTIL THIS IS REFACTORED TO ACCEPT MULTIPLE IN ADDRESSES
        var fromAddress : string = fromAddresses[0];
        var fromPrivateKey : string = fromPrivateKeys[0];

        return this.getUnspentTransactions(chainType, fromAddress, String(total)).then(utxos => {
            if (utxos) {
                if (!fromPrivateKey || toAddresses.length <= 0 || toAddresses.length != toAmounts.length) {
                    throw new Error(`${this.coin} - Error with send parameters.`);
                }

                var utxoTotal : number = 0;
                var lUtxos : any[] = [];
                for (var i = 0; i < utxos.length; i++) {
                    var utxoIn = {
                        "txId" : utxos[i].txid,
                        "outputIndex" : utxos[i].vout,
                        "address" : utxos[i].address,
                        "script" : utxos[i].scriptPubKey,
                        "satoshis" : utxos[i].satoshis
                    };
                    utxoTotal = utxoTotal + parseFloat(utxos[i])
                    lUtxos[i] = utxoIn;

                    if (utxoTotal > total + parseFloat(feeEstimate)) {
                        // if we have enough utxos for the transaction, stop collecting them...
                        break;
                    }
                }

                try {
                    var transaction = new this.dashcore.Transaction().from(lUtxos);
                    var privateKey = new this.dashcore.PrivateKey(fromPrivateKey);
                } catch {
                    throw new Error(`${this.coin} - Error creating private key and transaction.`);
                }

                console.log(" about to create transaction")
                
                for (var i = 0; i < toAddresses.length; i++) {
                    let inAmount : number = Math.trunc(parseFloat(toAmounts[i]) / 0.00000001);
                    transaction.to(toAddresses[i], inAmount);
                }

                return this.getTransactionFee(chainType, lUtxos.length, toAddresses.length).then(lfee => {
                    var lTxFee : string = String(parseFloat(lfee) / 0.00000001)

                    if (parseFloat(lfee) + total > utxoTotal) {

                        if ((utxoTotal - total) > 0 && ((utxoTotal - total) < parseFloat(lfee))) {
                            lTxFee = String(utxoTotal - total);
                        } else {
                            throw new Error(`${this.coin} - Not enough to cover fees in transaction creation.`);
                        }
                    }
                    
                    try {
                        transaction.change(fromAddress);
                        transaction.fee(parseFloat(lTxFee));

                        if (message !== "") {
                            transaction.addData(message);
                        }

                        transaction.sign(privateKey);
                    } catch {
                        throw new Error(`${this.coin} - Error signing raw transaction.`);
                    }
    
                    var txHex : string = transaction.toString();
                    return ({"txHex" : txHex, "fee" : lfee });
                });
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
        var fromAddresses : string[] = [fromAddress];
        var fromPrivateKeys : string[] = [fromPrivateKey];
        var returnAddress : string = fromAddress[0];
        var fee : string = "0.0001"; // fee should be fixed....
        return this.createTransactionHex(chainType, fromAddresses, fromPrivateKeys, toAddresses, toAmounts, fee, returnAddress, "").then(txhex => {
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

export { DashAPI, Network };