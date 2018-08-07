"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoAPI_1 = require("./CryptoAPI");
exports.Network = CryptoAPI_1.Network;
class DogecoinAPI extends CryptoAPI_1.CryptoAPI {
    createWallet(chainType, seed) {
        return ({ "address": "", "privateKey": "", "wif": "", "fromSeed": "" });
    }
    getBalance(chainType, address) {
        return "";
    }
    getUnspentTransactions(chainType, address, amount) {
        //https://dogechain.info/api/blockchain_api
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
}
exports.DogecoinAPI = DogecoinAPI;
//# sourceMappingURL=DogecoinAPI.js.map