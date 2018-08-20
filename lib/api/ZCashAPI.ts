import { CryptoAPI, Network } from "./CryptoAPI";
import { Config } from "../config/config";

class ZCashAPI extends CryptoAPI {

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

            newPrivateKey = new this.zcashcore.PrivateKey(bn);
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
        var insightUrl : string;
        if (chainType == 1) {
            insightUrl = this.config.insightServers.zec.main;
        } else {
            insightUrl = this.config.insightServers.zec.testnet;
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

    sendTransactionHex(network: Network, rawTransaction: string) {
        throw new Error("Method not implemented.");
    }

    getUnspentTransactions(chainType : Network, address: string, amount: string) {
        throw new Error("Method not implemented.");
    }

    getTransactionFee(chainType: Network, inputs: number, outputs: number): string {
        throw new Error("Method not implemented.");
    }

    send(chainType: Network, fromAddresses: string, fromPrivateKeys: string, toAddresses: string[], toAmounts: string[]) {
        throw new Error("Method not implemented.");
    }

    createTransactionHex(network: Network, fromAddress: string, fromPrivateKey: string, toAddresses: string[], toAmounts: string[], message: string) {
        throw new Error("Method not implemented.");
    }
}

export { ZCashAPI, Network };