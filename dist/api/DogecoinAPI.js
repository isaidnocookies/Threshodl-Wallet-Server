"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoAPI_1 = require("./CryptoAPI");
exports.Network = CryptoAPI_1.Network;
const config_1 = require("../config/config");
var StringMath = require('@isaidnocookies/StringMath');
class DogecoinAPI extends CryptoAPI_1.CryptoAPI {
    constructor() {
        super(...arguments);
        this.coin = "DOGE";
        this.config = new config_1.Config();
    }
    createWallet(chainType, seed) {
        return ({ "address": "", "privateKey": "", "wif": "", "fromSeed": "" });
    }
    getBalance(chainType, address) {
        var blockExplorerUrl;
        const axios = require('axios');
        if (chainType == 1) {
            blockExplorerUrl = this.config.blockExplorers.doge.main;
            return axios({
                method: 'get',
                url: blockExplorerUrl + '/get_address_balance/DOGE/' + address,
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
        else {
            blockExplorerUrl = this.config.blockExplorers.doge.testnet;
            return axios({
                method: 'get',
                url: blockExplorerUrl + '/get_address_balance/DOGETEST/' + address,
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
        //https://dogechain.info/api/blockchain_api
        throw new Error("Method not implemented.");
    }
    getTransactionFee(chainType, inputs, outputs) {
        // TODO
        console.log(`Error getting ${this.coin} transaction fee - returning default`);
        return this.config.defaultFees.defaultFees;
    }
    createTransactionHex(network, fromAddress, fromPrivateKey, toAddresses, toAmounts, returnAddress, fee, message) {
        throw new Error("Method not implemented.");
    }
    sendTransactionHex(network, rawTransaction) {
        throw new Error("Method not implemented.");
    }
}
exports.DogecoinAPI = DogecoinAPI;
//# sourceMappingURL=DogecoinAPI.js.map