import { CryptoAPI, Network } from "./CryptoAPI";

class DashAPI extends CryptoAPI {
    
    network: Network;
    dashcore: any = require('dashcore-lib');

    createWallet(chainType : Network, seed : string) {
        var newPrivateKey: any;
        var newWif: string;
        var newAddress: string;
        var fromSeed: boolean;
        var network: any;
        var success: boolean = true;

        if (chainType == Network.Mainnet) {
            network = this.dashcore.Networks.Mainnet;
        } else if (chainType == Network.Testnet) {
            network = this.dashcore.Networks.Testnet;
        } else if (chainType == Network.Regtest) {
            network = this.dashcore.Networks.Regtest;
        } else {
            success = false;
        }

        if(seed && success) {
            var theSeedValue = Buffer.from(seed)
            var hash = this.dashcore.crypto.Hash.sha256(theSeedValue);
            var bn = this.dashcore.crypto.BN.fromBuffer(hash);

            newPrivateKey = new this.dashcore.PrivateKey(bn);
            fromSeed = true;
        } else if (success) {
            newPrivateKey = new this.dashcore.PrivateKey.fromRandom(network);
            fromSeed = false;
        }

        if (success) {
            newWif = newPrivateKey.toWIF();
            newAddress = newPrivateKey.toAddress(this.dashcore.Networks.testnet).toString();
        }

        if (!newPrivateKey || !newWif || !newAddress) {
            newPrivateKey = "";
            newWif = "";
            newAddress = "";
            fromSeed = false;
        }

        this.dashcore = null;
        return ({"address" : newAddress, "privateKey": newPrivateKey, "wif": newWif, "fromSeed": fromSeed});
    }

    getBalance(chainType: Network, address : string) {
        return "";
    }
}

export { DashAPI, Network };