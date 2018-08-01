import { CryptoAPI, Network } from "./CryptoAPI";
import { Config } from "../config/config";

class BitcoinAPI extends CryptoAPI {
    
    coin: string = "BTC";
    network: Network;
    bitcoreMnemonic: any = require('bitcore-mnemonic');
    bitcore: any = this.bitcoreMnemonic.bitcore;
    config : any = new Config();

    createWallet(chainType : Network, seed : string) {
        var newPrivateKey: any;
        var newWif: string;
        var newAddress: string;
        var fromSeed: boolean;
        var network: any;
        var success: boolean = true;

        if (chainType == Network.Mainnet) {
            network = this.bitcore.Networks.Mainnet;
        } else if (chainType == Network.Testnet) {
            network = this.bitcore.Networks.Testnet;
        } else if (chainType == Network.Regtest) {
            network = this.bitcore.Networks.Regtest;
        } else {
            success = false;
        }

        if(seed && success) {
            var theSeedValue = Buffer.from(seed)
            var hash = this.bitcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.bitcore.crypto.BN.fromBuffer(hash);

            newPrivateKey = new this.bitcore.PrivateKey(bn);
            fromSeed = true;
        } else if (success) {
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
        return ({"address" : newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed});
    }

    getBalance(chainType: Network, address : string) {
        return "";
    }

    getUnspentTransactions(address : string, amount : string) {
        return this.getUnspentTransactionsInternal(address, amount, 3);
    }

    getUnspentTransactionsInternal(address : string, amount : string, attempts : number) {
        const axios = require('axios');
        return axios({
            method:'get',
            url:this.config.insightServers.btc.host + '/addr/' + address + "/utxo",
            responseType:'application/json'
        }).then(function(response) {
            return response.data;
        }).catch(error => {
            if (attempts > 0){
                return this.getUnspentTransactionsInternal(address, amount, --attempts);
            }
            return null;
        });
    }

    getTransactionFee(chainType: Network, inputs: number, outputs: number): string {
        throw new Error("Method not implemented.");
    }

    send(chainType: Network, fromAddresses: string[], fromPrivateKeys: string[], toAddresses: string[], toAmounts: string[]) {
        throw new Error("Method not implemented.");
    }
}

export { BitcoinAPI, Network };