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
var StringMath = require('@isaidnocookies/StringMath');
class DashAPI extends CryptoAPI_1.CryptoAPI {
    constructor() {
        super(...arguments);
        this.coin = "DASH";
        this.dashcore = require('dashcore-lib');
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
            network = this.dashcore.Networks.livenet;
        }
        else if (chainType == CryptoAPI_1.Network.Testnet) {
            network = this.dashcore.Networks.testnet;
        }
        else {
            success = false;
        }
        if (seed && success) {
            var theSeedValue = Buffer.from(seed);
            var hash = this.dashcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.dashcore.crypto.BN.fromBuffer(hash);
            newPrivateKey = new this.dashcore.PrivateKey(bn, network);
            fromSeed = true;
        }
        else if (success) {
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
        return ({ "address": newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed });
    }
    getBalance(chainType, address) {
        const axios = require('axios');
        var blockExplorerUrl;
        if (chainType == 1) {
            blockExplorerUrl = this.config.blockExplorers.dash.main;
            return axios({
                method: 'get',
                url: blockExplorerUrl + '/addr/' + address,
                responseType: 'application/json'
            }).then(function (response) {
                return ({ "confirmed": response.data.balance, "unconfirmed": response.data.unconfirmedBalance });
            }).catch(error => {
                return ({ "confirmed": "-1", "unconfirmed": "-1" });
            });
        }
        else {
            // TESTNET USES SOCHAIN INSTEAD OF TRADITIONAL INSIGHT APIS
            blockExplorerUrl = this.config.blockExplorers.dash.testnet;
            return axios({
                method: 'get',
                url: blockExplorerUrl + '/get_address_balance/DASHTEST/' + address,
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
    getUnspentTransactions(chainType, address, amount) {
        return this.getUnspentTransactionsInternal(chainType, address, amount, 3);
    }
    getUnspentTransactionsInternal(chainType, address, amount, attempts) {
        const axios = require('axios');
        var blockExplorerUrl;
        if (chainType == 1) {
            blockExplorerUrl = this.config.blockExplorers.dash.main;
        }
        else {
            blockExplorerUrl = this.config.blockExplorers.dash.testnet;
        }
        return axios({
            method: 'get',
            url: blockExplorerUrl + '/addr/' + address + "/utxo",
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
        var blockExplorerUrl;
        var blockAmount = "4";
        var blockExplorerUrl;
        if (chainType == 1) {
            blockExplorerUrl = this.config.blockExplorers.dash.main;
        }
        else {
            blockExplorerUrl = this.config.blockExplorers.dash.testnet;
        }
        let defaultFee = 0.00005;
        var transactionSize = (inputs * 180) + (outputs * 34) + 10; // bytes
        return axios({
            method: 'get',
            url: blockExplorerUrl + "/utils/estimatefee?nbBlocks=" + blockAmount,
            responseType: 'application/json'
        }).then(function (response) {
            const responseKeys = Object.keys(response.data);
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
            return this.config.defaultFees.dash;
        });
    }
    createTransactionHex(chainType, fromAddresses, fromPrivateKeys, toAddresses, toAmounts, returnAddress, fee, message) {
        return __awaiter(this, void 0, void 0, function* () {
            var outTotal = "0.00";
            var inTotal = "0.00";
            var inputs = [];
            var lUtxos = [];
            var inputCount = 0;
            var thePrivateKeys = [];
            var transactionFee;
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
                    var input = {};
                    var unspentTransactions = yield this.getUnspentTransactions(chainType, addr, "NOTUSEDYET");
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
                        var privateKey = new this.dashcore.PrivateKey(fromPrivateKeys[index]);
                        thePrivateKeys.push(privateKey);
                    }
                    catch (_a) {
                        throw new Error(`${this.coin} - Error creating private key and transaction.`);
                    }
                }
                ;
            }
            catch (_b) {
                throw new Error(`${this.coin} - Error with send parameters.`);
            }
            if (stringmath.isLessThanOrEqualTo(inTotal, outTotal)) {
                throw new Error(`${this.coin} - Not enough for outputs and fees...`);
            }
            else {
                try {
                    var transaction = new this.dashcore.Transaction().from(lUtxos);
                    for (var i = 0; i < toAddresses.length; i++) {
                        var outAmount = Math.trunc(parseFloat(toAmounts[i]) / 0.00000001);
                        transaction.to(toAddresses[i], outAmount);
                    }
                    if (dynamicFee) {
                        var calculatedTransactionFee = yield this.getTransactionFee(chainType, inputCount, toAddresses.length);
                        transactionFee = calculatedTransactionFee.toString();
                    }
                    else {
                        transactionFee = fee;
                    }
                    var paramDiff = stringmath.subtract(inTotal, outTotal);
                    if (stringmath.isLessThan(paramDiff, transactionFee.toString())) {
                        if (dynamicFee && toAddresses.length === 1) {
                            transaction.clearOutputs();
                            var newOutAmount = toAmounts[0];
                            var somethingOrOther = stringmath.subtract(transactionFee, paramDiff);
                            newOutAmount = stringmath.subtract(newOutAmount, somethingOrOther);
                            var fuckingNewOutputMinusFee = Math.trunc(parseFloat(newOutAmount) / 0.00000001);
                            transaction.to(toAddresses[0], fuckingNewOutputMinusFee);
                        }
                        else {
                            throw new Error(`${this.coin} - Not enough left for fees...`);
                        }
                    }
                    transaction.fee(Math.trunc(parseFloat(transactionFee) / 0.00000001));
                    transaction.change(returnAddress);
                    thePrivateKeys.forEach((pk) => {
                        transaction.sign(pk);
                    });
                }
                catch (error) {
                    throw new Error("Failed to create transaction and sign transaction" + ` ${this.coin}` + `${error}`);
                }
            }
            var txHex = transaction.toString();
            return ({ "txHex": txHex, "fee": transactionFee });
        });
    }
    sendTransactionHex(chainType, txHex) {
        const axios = require('axios');
        var blockExplorerUrl;
        console.log("Sending transaction... : " + txHex);
        if (chainType === 1) {
            blockExplorerUrl = this.config.blockExplorers.dash.main + "/tx/send";
        }
        else {
            blockExplorerUrl = this.config.blockExplorers.dash.testnet + "/tx/send";
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
                }
                else {
                    let message = {
                        message: `Error sending raw transaction: ${this.coin.toUpperCase()} ---- ${response.data}.`,
                        data: response,
                    };
                    throw new Error(`${this.coin} - Error sending raw transaction. Error  ${JSON.stringify(message)}`);
                }
            }).catch(error => {
                throw new Error(`${this.coin} - Error sending raw transaction. - ${error}`);
            });
        }
        catch (error) {
            throw new Error(`${this.coin} - Error with request for sending transaction hex. - ${error}`);
        }
    }
}
exports.DashAPI = DashAPI;
//# sourceMappingURL=DashAPI.js.map