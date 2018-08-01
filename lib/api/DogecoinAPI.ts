import { CryptoAPI, Network } from "./CryptoAPI";

class DogecoinAPI extends CryptoAPI {
    
    network: Network;

    createWallet(chainType : Network, seed : string) {
        
        return ({"address" : "", "privateKey": "", "wif": "", "fromSeed": ""});
    }

    getBalance(chainType: Network, address : string) {
        return "";
    }

    getTransactionFee(chainType: Network, inputs: number, outputs: number): string {
        throw new Error("Method not implemented.");
    }

    send(chainType: Network, fromAddresses: string[], fromPrivateKeys: string[], toAddresses: string[], toAmounts: string[]) {
        throw new Error("Method not implemented.");
    }
}

export { DogecoinAPI, Network };