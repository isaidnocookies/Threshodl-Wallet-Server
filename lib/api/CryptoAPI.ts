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
    abstract getUnspentTransactions(chainType : Network, address : string, amount : string) : any;
    abstract createTransactionHex(network: Network, fromAddresses : string[], fromPrivateKeys : string[], toAddresses : string[], toAmounts : string[], returnAddress : string, fee : string, message : string) : any;
    abstract sendTransactionHex(network: Network, rawTransaction : string) : any;
}

export { CryptoAPI, Network };