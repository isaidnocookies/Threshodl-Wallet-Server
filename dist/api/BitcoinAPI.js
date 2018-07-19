"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoAPI_1 = require("./CryptoAPI");
exports.Network = CryptoAPI_1.Network;
class BitcoinAPI extends CryptoAPI_1.CryptoAPI {
    // bitcore: any = require('bitcore-lib');
    createWallet(chainType, seed) {
        var newPrivateKey;
        var newWif;
        var newAddress;
        var fromSeed;
        var network;
        var success = true;
        // Workaround for multiple instances of bitcore-lib
        delete global["_bitcore"];
        let bitcore = require('bitcore-lib');
        if (chainType == CryptoAPI_1.Network.Mainnet) {
            network = bitcore.Networks.Mainnet;
        }
        else if (chainType == CryptoAPI_1.Network.Testnet) {
            network = bitcore.Networks.Testnet;
        }
        else if (chainType == CryptoAPI_1.Network.Regtest) {
            network = bitcore.Networks.Regtest;
        }
        else {
            success = false;
        }
        if (seed && success) {
            var theSeedValue = Buffer.from(seed);
            var hash = bitcore.crypto.Hash.sha256(theSeedValue);
            var bn = bitcore.crypto.BN.fromBuffer(hash);
            newPrivateKey = new bitcore.PrivateKey(bn);
            fromSeed = true;
        }
        else if (success) {
            newPrivateKey = new bitcore.PrivateKey.fromRandom(network);
            fromSeed = false;
        }
        if (success) {
            newWif = newPrivateKey.toWIF();
            newAddress = newPrivateKey.toAddress(bitcore.Networks.testnet).toString();
        }
        if (!newPrivateKey || !newWif || !newAddress) {
            newPrivateKey = "";
            newWif = "";
            newAddress = "";
            fromSeed = false;
        }
        bitcore = null;
        return ({ "address": newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed });
    }
    getBalance(chainType, address) {
        return "";
    }
}
exports.BitcoinAPI = BitcoinAPI;
//# sourceMappingURL=BitcoinAPI.js.map