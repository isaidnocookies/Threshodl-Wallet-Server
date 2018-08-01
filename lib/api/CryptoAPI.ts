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
    abstract send(chainType : Network, fromAddresses : string[], fromPrivateKeys : string[], toAddresses : string[], toAmounts : string[]) : any;
    abstract getUnspentTransactions(address : string, amount : string) : any;
}

export { CryptoAPI, Network };