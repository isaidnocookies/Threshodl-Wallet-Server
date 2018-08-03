enum Network {
    Mainnet = 1,
    Testnet,
    Regtest,
    Invalid,
}

abstract class CryptoAPI {
    constructor () {}

    abstract createWallet(chainType : Network, seed : string) : any;
    abstract getBalance(chainType : Network, address : string) : any;
    abstract getTransactionFee(chainType : Network, inputs : number, outputs : number) : any;
    abstract send(chainType : Network, fromAddress : string, fromPrivateKey : string, toAddresses : string[], toAmounts : string[]) : any;
    abstract getUnspentTransactions(chainType : Network, address : string, amount : string) : any;
}

export { CryptoAPI, Network };