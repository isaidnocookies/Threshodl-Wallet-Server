enum Network {
    Mainnet = 1,
    Testnet,
    Regtest,
    Invalid,
}

abstract class CryptoAPI {
    constructor () {}

    abstract createWallet(chainType : Network, seed : string) : any;
    abstract getBalance(chainType : Network, address : string) : string;
}

export { CryptoAPI, Network };