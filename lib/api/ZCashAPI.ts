import { CryptoAPI, Network } from "./CryptoAPI";
import { Config } from "../config/config";

var StringMath = require('@isaidnocookies/StringMath');

class ZCashAPI extends CryptoAPI {

    coin: string = "ZEC";
    network: Network;
    zcashcore: any = require('zcash-bitcore-lib');
    config : any = new Config();

    createWallet(chainType : Network, seed : string) {
        var newPrivateKey: any;
        var newWif: string;
        var newAddress: string;
        var fromSeed: boolean;
        var network: any;
        var success: boolean = true;

        if (chainType == Network.Mainnet) {
            network = this.zcashcore.Networks.livenet;
        } else if (chainType == Network.Testnet) {
            network = this.zcashcore.Networks.testnet;
        } else {
            success = false;
        }

        if(seed && success) {
            var theSeedValue = Buffer.from(seed)
            var hash = this.zcashcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.zcashcore.crypto.BN.fromBuffer(hash);

            newPrivateKey = new this.zcashcore.PrivateKey(bn,network);
            fromSeed = true;
        } else if (success) {
            newPrivateKey = new this.zcashcore.PrivateKey.fromRandom(network);
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

        this.zcashcore = null;
        return ({"address" : newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed});
    }

    getBalance(chainType: Network, address : string) {
        var blockExplorerUrl : string;
        const axios = require('axios');
        
        if (chainType == 1) {
            blockExplorerUrl = this.config.blockExplorers.zec.main;
            return axios({
                method: 'get',
                url: blockExplorerUrl + '/addr/' + address,
                responseType: 'application/json'
            }).then(function (response) {
                return ({ "confirmed": response.data.balance, "unconfirmed": response.data.unconfirmedBalance });
            }).catch(error => {
                return ({ "confirmed": "-1", "unconfirmed": "-1" });
            });
        } else {
            // TESTNET USES SOCHAIN INSTEAD OF TRADITIONAL INSIGHT APIS
            blockExplorerUrl = this.config.blockExplorers.zec.testnet;
            return axios({
                method: 'get',
                url: blockExplorerUrl + '/get_address_balance/ZECTEST/' + address,
                responseType: 'application/json'
            }).then(function (response) {
                if (response.data.status !== "success") {
                    throw new Error(`${this.coin} : network ${chainType} : Failed to poll balances`);
                }
                return ({ "confirmed": response.data.data.confirmed_balance, "unconfirmed": response.data.data.unconfirmed_balance });
            }).catch(error => {
                return ({ "confirmed": "-1", "unconfirmed": "-1" });
            });
        }
    }

    getTransactionFee(chainType: Network, inputs: number, outputs: number): any {
        const axios = require('axios');

        var blockExplorerUrl: string;
        var blockAmount: string = "4";
        if (chainType == 1) {
            blockExplorerUrl = this.config.blockExplorers.zec.main;
        } else {
            blockExplorerUrl = this.config.blockExplorers.zec.testnet;
        }

        let defaultFee: number = 0.00001;

        var transactionSize: number = (inputs * 180) + (outputs * 34) + 10; // bytes

        return axios({
            method: 'get',
            url: blockExplorerUrl + "/utils/estimatefee?nbBlocks=" + blockAmount,
            responseType: 'application/json'
        }).then(function (response) {
            const responseKeys: any = Object.keys(response.data);

            if (responseKeys.length != 1) {
                return defaultFee;
            }

            var feeperkb = response.data[responseKeys[0]];
            if (feeperkb <= 0) {
                return defaultFee;
            }

            return (transactionSize * (feeperkb / 1000));
        }).catch(error => {
            console.log(`Error getting ${this.coin} transaction fee - returning default`);
            return this.config.defaultFees.zec;
        });
    }

    getUnspentTransactions(chainType : Network, address : string, amount : string) {
        return this.getUnspentTransactionsInternal(chainType, address, amount, 3);
    }

    getUnspentTransactionsInternal(chainType : Network, address : string, amount : string, attempts : number) {
        const axios = require('axios');
        var blockExplorerUrl : string;

        if (chainType == 1) {
            blockExplorerUrl = this.config.blockExplorers.zec.main;
        } else {
            blockExplorerUrl = this.config.blockExplorers.zec.testnet;
        }

        return axios({
            method:'get',
            url:blockExplorerUrl + '/addr/' + address + "/utxo",
            responseType:'application/json'
        }).then(function(response) {
            return response.data;
        }).catch(error => {
            if (attempts > 0){
                return this.getUnspentTransactionsInternal(chainType, address, amount, --attempts);
            }
            console.log("Error - Get upspent transactions internal failed...");
            return null;
        });
    }

    async createTransactionHex(chainType: Network, fromAddresses: string[], fromPrivateKeys: string[], toAddresses: string[], toAmounts: string[], returnAddress: string, fee : string, message: string) {
        var outTotal: string = "0.00";
        var inTotal: string = "0.00";
        var inputs: any = [];
        var lUtxos: any[] = [];
        var inputCount: number = 0;
        var thePrivateKeys: any[] = [];
        var transactionFee: string;
        var stringmath = new StringMath();

        var dynamicFee = (fee === "") ? true : false;

        for (var i = 0; i < toAmounts.length; i++) {
            outTotal = stringmath.add(outTotal, toAmounts[i]);
        }

        if (fromAddresses.length != fromPrivateKeys.length && toAddresses.length != toAmounts.length) {
            throw new Error(`${this.coin} - Mismatch between input pairs (fromAddresses/fromPrivateKeys or toAddresses/toAmounts)`);
        }

        try {
            for (var index = 0; index < fromAddresses.length; index++) {
                var addr = fromAddresses[index];
                var input: any = {};
                var unspentTransactions: any = await this.getUnspentTransactions(chainType, addr, "NOTUSEDYET");
                input.utxos = unspentTransactions;
                input.addr = addr;
                input.privateKey = fromPrivateKeys[index];
                inputs.push(input);

                for (var i = 0; i < unspentTransactions.length; i++) {
                    var utxoIn = {
                        "txId": unspentTransactions[i].txid,
                        "outputIndex": unspentTransactions[i].vout,
                        "address": unspentTransactions[i].address,
                        "script": unspentTransactions[i].scriptPubKey,
                        "satoshis": unspentTransactions[i].satoshis
                    };
                    lUtxos.push(utxoIn);
                    inputCount++;
                    inTotal = stringmath.add(inTotal, unspentTransactions[i].amount.toString());
                }

                try {
                    var privateKey = new this.zcashcore.PrivateKey(fromPrivateKeys[index]);
                    thePrivateKeys.push(privateKey);
                } catch {
                    throw new Error(`${this.coin} - Error creating private key and transaction.`);
                }
            };
        } catch {
            throw new Error(`${this.coin} - Error with send parameters.`);
        }

        if (stringmath.isLessThanOrEqualTo(inTotal, outTotal)) {
            throw new Error(`${this.coin} - Not enough for outputs and fees...`);
        } else {
            try {
                var transaction = new this.zcashcore.Transaction().from(lUtxos);

                for (var i = 0; i < toAddresses.length; i++) {
                    var outAmount: number = Math.trunc(parseFloat(toAmounts[i]) / 0.00000001);
                    transaction.to(toAddresses[i], outAmount);
                }

                if (dynamicFee) {
                    var calculatedTransactionFee = await this.getTransactionFee(chainType, inputCount, toAddresses.length);
                    transactionFee = calculatedTransactionFee.toString();
                } else {
                    transactionFee = fee;
                }

                var paramDiff = stringmath.subtract(inTotal, outTotal);
                if (stringmath.isLessThan(paramDiff, transactionFee.toString())) {
                    if (dynamicFee && toAddresses.length === 1) {
                        transaction.clearOutputs();
                        var newOutAmount = toAmounts[0];

                        var somethingOrOther = stringmath.subtract(transactionFee, paramDiff);
                        newOutAmount = stringmath.subtract(newOutAmount, somethingOrOther);
                        var fuckingNewOutputMinusFee: number = Math.trunc(parseFloat(newOutAmount) / 0.00000001);
                        transaction.to(toAddresses[0], fuckingNewOutputMinusFee);
                    } else {
                        throw new Error(`${this.coin} - Not enough left for fees...`);
                    }
                }

                transaction.fee(Math.trunc(parseFloat(transactionFee) / 0.00000001));
                transaction.change(returnAddress);

                thePrivateKeys.forEach((pk) => {
                    transaction.sign(pk);
                });
            } catch (error) {
                throw new Error("Failed to create transaction and sign transaction" + ` ${this.coin}` + `${error}`);
            }
        }

        var txHex: string = transaction.toString();
        return ({ "txHex": txHex, "fee": transactionFee });
    }

    sendTransactionHex(chainType: Network, txHex : string) {
        const axios = require('axios');

        var blockExplorerUrl: string;
        console.log("Sending transaction... : " + txHex);

        if (chainType === 1) {
            blockExplorerUrl = this.config.blockExplorers.zec.main + "/tx/send";
        } else {
            blockExplorerUrl = this.config.blockExplorers.zec.testnet + "/tx/send";
        }
        try {
            return axios({
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                url: blockExplorerUrl,
                data: {
                    "rawtx": txHex
                }
            }).then(response => {
                if (response.data.txid && response.status == 200) {
                    return response.data.txid;
                } else {
                    let message = {
                        message: `Error sending raw transaction: ${this.coin.toUpperCase()} ---- ${response.data}.`,
                        data: response,
                    };
                    throw new Error(`${this.coin} - Error sending raw transaction. Error  ${JSON.stringify(message)}`);
                }
            }).catch(error => {
                throw new Error(`${this.coin} - Error sending raw transaction. - ${error}`);
            });
        } catch (error) {
            throw new Error(`${this.coin} - Error with request for sending transaction hex. - ${error}`);
        }
    }
}

export { ZCashAPI, Network };