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
        return "";
    }
    getUnspentTransactions(address, amount) {
        return this.getUnspentTransactionsInternal(address, amount, 3);
    }
    getUnspentTransactionsInternal(address, amount, attempts) {
        const axios = require('axios');
        return axios({
            method: 'get',
            url: this.config.insightServers.btc.host + '/addr/' + address + "/utxo",
            responseType: 'application/json'
        }).then(function (response) {
            return response.data;
        }).catch(error => {
            if (attempts > 0) {
                return this.getUnspentTransactionsInternal(address, amount, --attempts);
            }
            return null;
        });
    }
    getTransactionFee(chainType, inputs, outputs) {
        throw new Error("Method not implemented.");
    }
    send(chainType, fromAddresses, fromPrivateKeys, toAddresses, toAmounts) {
        throw new Error("Method not implemented.");
    }
}
exports.BitcoinAPI = BitcoinAPI;
//# sourceMappingURL=BitcoinAPI.js.map