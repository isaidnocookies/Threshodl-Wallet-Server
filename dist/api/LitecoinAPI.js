"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoAPI_1 = require("./CryptoAPI");
exports.Network = CryptoAPI_1.Network;
class LitecoinAPI extends CryptoAPI_1.CryptoAPI {
    constructor() {
        super(...arguments);
        this.litecore = require('litecore-lib');
    }
    createWallet(chainType, seed) {
        var newPrivateKey;
        var newWif;
        var newAddress;
        var fromSeed;
        var network;
        var success = true;
        if (chainType == CryptoAPI_1.Network.Mainnet) {
            network = this.litecore.Networks.livenet;
        }
        else if (chainType == CryptoAPI_1.Network.Testnet) {
            network = this.litecore.Networks.testnet;
        }
        else {
            success = false;
        }
        if (seed && success) {
            var theSeedValue = Buffer.from(seed);
            var hash = this.litecore.crypto.Hash.sha256(theSeedValue);
            var bn = this.litecore.crypto.BN.fromBuffer(hash);
            newPrivateKey = new this.litecore.PrivateKey(bn);
            fromSeed = true;
        }
        else if (success) {
            newPrivateKey = new this.litecore.PrivateKey.fromRandom(network);
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
        this.litecore = null;
        return ({ "address": newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed });
    }
    getBalance(chainType, address) {
        return "";
    }
    getUnspentTransactions(chainType, address, amount) {
        throw new Error("Method not implemented.");
    }
    getTransactionFee(chainType, inputs, outputs) {
        throw new Error("Method not implemented.");
    }
    send(chainType, fromAddresses, fromPrivateKeys, toAddresses, toAmounts) {
        throw new Error("Method not implemented.");
    }
    createTransactionHex(network, fromAddress, fromPrivateKey, toAddresses, toAmounts, message) {
        throw new Error("Method not implemented.");
    }
    sendTransactionHex(network, rawTransaction) {
        throw new Error("Method not implemented.");
    }
}
exports.LitecoinAPI = LitecoinAPI;
//# sourceMappingURL=LitecoinAPI.js.map