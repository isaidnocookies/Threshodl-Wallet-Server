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
            network = this.litecore.Networks.Mainnet;
        }
        else if (chainType == CryptoAPI_1.Network.Testnet) {
            network = this.litecore.Networks.Testnet;
        }
        else if (chainType == CryptoAPI_1.Network.Regtest) {
            network = this.litecore.Networks.Regtest;
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
            newAddress = newPrivateKey.toAddress(this.litecore.Networks.testnet).toString();
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
    getUnspentTransactions(address, amount) {
        throw new Error("Method not implemented.");
    }
    getTransactionFee(chainType, inputs, outputs) {
        throw new Error("Method not implemented.");
    }
    send(chainType, fromAddresses, fromPrivateKeys, toAddresses, toAmounts) {
        throw new Error("Method not implemented.");
    }
}
exports.LitecoinAPI = LitecoinAPI;
//# sourceMappingURL=LitecoinAPI.js.map