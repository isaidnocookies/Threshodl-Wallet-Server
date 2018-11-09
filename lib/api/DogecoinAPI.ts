import { CryptoAPI, Network } from "./CryptoAPI";

class DogecoinAPI extends CryptoAPI {
    
    network: Network;

    createWallet(chainType : Network, seed : string) {
        
        return ({"address" : "", "privateKey": "", "wif": "", "fromSeed": ""});
    }

    getBalance(chainType: Network, address : string) {
        return "";
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