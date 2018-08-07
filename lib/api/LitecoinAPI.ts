import { CryptoAPI, Network } from "./CryptoAPI";

class LitecoinAPI extends CryptoAPI {
    
    network: Network;
    litecore: any = require('litecore-lib');

    createWallet(chainType : Network, seed : string) {
        var newPrivateKey: any;
        var newWif: string;
        var newAddress: string;
        var fromSeed: boolean;
        var network: any;
        var success: boolean = true;

        if (chainType == Network.Mainnet) {
            network = this.litecore.Networks.Mainnet;
        } else if (chainType == Network.Testnet) {
            network = this.litecore.Networks.Testnet;
        } else if (chainType == Network.Regtest) {
            network = this.litecore.Networks.Regtest;
        } else {
            success = false;
        }

        if(seed && success) {
            var theSeedValue = Buffer.from(seed)
            var hash = this.litecore.crypto.Hash.sha256(theSeedValue);
            var bn = this.litecore.crypto.BN.fromBuffer(hash);

            newPrivateKey = new this.litecore.PrivateKey(bn);
            fromSeed = true;
        } else if (success) {
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
        return ({"address" : newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed});
    }

    getBalance(chainType: Network, address : string) {
        return "";
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

export { LitecoinAPI, Network };