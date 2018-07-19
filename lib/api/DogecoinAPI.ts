import { CryptoAPI, Network } from "./CryptoAPI";

class DogecoinAPI extends CryptoAPI {
    
    network: Network;

    createWallet(chainType : Network, seed : string) {
        
        return ({"address" : "", "privateKey": "", "wif": "", "fromSeed": ""});
    }

    getBalance(chainType: Network, address : string) {
        return "";
    }
}

export { DogecoinAPI, Network };