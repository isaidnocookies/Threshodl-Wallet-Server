import { CryptoAPI, Network } from "./CryptoAPI";
import { Config } from "../config/config";

var StringMath = require('@isaidnocookies/StringMath');

class DogecoinAPI extends CryptoAPI {
    
    coin: string = "DOGE";
    network: Network;
    config: any = new Config();

    createWallet(chainType : Network, seed : string) {
        
        return ({"address" : "", "privateKey": "", "wif": "", "fromSeed": ""});
    }

    getBalance(chainType: Network, address : string) {
        var blockExplorerUrl: string;
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
        } else {
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

    getUnspentTransactions(chainType : Network, address: string, amount: string) {
        //https://dogechain.info/api/blockchain_api
        throw new Error("Method not implemented.");
    }

    getTransactionFee(chainType: Network, inputs: number, outputs: number): string {
        throw new Error("Method not implemented.");
    }

    createTransactionHex(network: Network, fromAddress: string[], fromPrivateKey: string[], toAddresses: string[], toAmounts: string[], returnAddress: string, fee : string, message: string) {
        throw new Error("Method not implemented.");
    }

    sendTransactionHex(network: Network, rawTransaction: string) {
        throw new Error("Method not implemented.");
    }
}

export { DogecoinAPI, Network };