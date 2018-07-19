import { CryptoAPI, Network } from "./CryptoAPI";

class BitcoinAPI extends CryptoAPI {
    
    network: Network;
    bitcoreMnemonic: any = require('bitcore-mnemonic');
    bitcore: any = this.bitcoreMnemonic.bitcore;

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
}

export { BitcoinAPI, Network };