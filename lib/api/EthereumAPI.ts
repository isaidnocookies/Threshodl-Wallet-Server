import { CryptoAPI, Network } from "./CryptoAPI";
import { Config } from "../config/config";

var EthTx = require('ethereumjs-tx');
var StringMath = require('@isaidnocookies/StringMath');

class EthereumAPI extends CryptoAPI {
    
    coin: string = "ETH";
    network: Network;
    config: any = new Config();
    
    createWallet(chainType: Network, seed: string) {
        return ({ "address": "", "privateKey": "", "wif": "", "fromSeed": "" });
    }
    
    getBalance(chainType: Network, address: string) {
        var Web3 = require('web3');
        var endpointURL : string;
        
        if (chainType === Network.Mainnet) {
            endpointURL = this.config.infura.mainnet;
        } else {
            endpointURL = this.config.infura.ropsten;
        }

        var web3 : any = new Web3(new Web3.providers.HttpProvider(endpointURL));
        var balance : any = web3.eth.getBalance(address);

        return balance.then(balance => {
            var etherBalance : string = web3.utils.fromWei(balance, "ether");

            return ({ "confirmed": etherBalance, "unconfirmed": etherBalance});
        }).catch(error => {
            console.log(error);
            return ({ "confirmed": "-1", "unconfirmed": "-1" });

        });
    }

    getUnspentTransactions(chainType: Network, address: string, amount: string) {
        throw new Error("Method not implemented.");
    }

    getTransactionFee(chainType: Network, inputs: number, outputs: number): string {
        // TODO
        console.log(`Error getting ${this.coin} transaction fee - returning default`);
        return this.config.defaultFees.defaultFees;
    }

    createTransactionHex(network: Network, fromAddress: string[], fromPrivateKey: string[], toAddresses: string[], toAmounts: string[], returnAddress: string, fee: string, message: string) {
        throw new Error("Method not implemented.");
    }

    sendTransactionHex(network: Network, rawTransaction: string) {
        throw new Error("Method not implemented.");
    }
}

export { EthereumAPI, Network };