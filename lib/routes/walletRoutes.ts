import { Request, Response } from 'express';

import { CryptoAPI } from "../api/CryptoAPI";

import { BitcoinAPI } from "../api/BitcoinAPI";
import { ZCashAPI } from "../api/ZCashAPI";
import { LitecoinAPI } from "../api/LitecoinAPI";
import { DashAPI } from "../api/DashAPI";
import { DogecoinAPI } from "../api/DogecoinAPI";

export class WalletRoutes {
    public routes (app) : any {
        app.route('/wallets/').get((req: Request, res: Response) => {
            res.status(200).send({message: "Wallets api ping"})
        })

        app.post('/wallets/testing/', (req: Request, res: Response) => {
            res.status(200).send({message: "Wallet testing call"})
        });

        app.post('/wallets/create/', (req: Request, res: Response) => {
            let api : CryptoAPI;

            var coins : string[] = req.body.coins;
            var seed : string = req.body.seed;
            var numberOfCoins : number = coins.length;
            var newWallets = new Object();
            
            if (numberOfCoins <= 0) {
                res.send(JSON.stringify({success: false, message: "No coins specified"}));
            } else {
                for (var i = 0; i < numberOfCoins; i++) {
                    var coin = coins[i];
                    var theCoinPrefix : string;
                    var network : number;

                    if (coin.charAt(0) === "t") {
                        network = 2;
                        coin = coin.substring(1, coin.length)
                        theCoinPrefix = "t";
                    } else {
                        network = 1;
                        theCoinPrefix = "";
                    }

                    switch(coin) {
                        case 'BTC': api = new BitcoinAPI; break;
                        case 'LTC': api = new LitecoinAPI; break;
                        case 'DASH': api = new DashAPI; break;
                        case 'ZEC': api = new ZCashAPI; break;
                        case 'DOGE': api = new DogecoinAPI; break;
                        default:
                            newWallets[coin] = {"address" : "", "privateKey": "", "wif": "", "fromSeed": false};
                            continue;
                    }

                    newWallets[theCoinPrefix + coin] = api.createWallet(network, seed);
                    api = null;
                }
            }
            res.status(200).send(JSON.stringify({success: true, message: newWallets}));
        });

        app.post('/wallets/utxos/', (req: Request, res: Response) => {
            var address : string = req.body.address;
            var amount : string =  req.body.amount;
            var coin : string = req.body.coin;
            var network : number;

            let api : CryptoAPI;

            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length)
            } else {
                network = 1;
            }

            switch(coin) {
                case 'BTC': api = new BitcoinAPI; break;
                case 'LTC': api = new LitecoinAPI; break;
                case 'DASH': api = new DashAPI; break;
                case 'ZEC': api = new ZCashAPI; break;
                case 'DOGE': api = new DogecoinAPI; break;
                default:
                    res.status(401).send(JSON.stringify({success: false}));
                    return;
            }

            api.getUnspentTransactions(network, address, amount).then(utxos => {
                if (utxos) {
                    res.status(200).send(JSON.stringify({success: true, response: JSON.stringify(utxos)}));
                } else {
                    res.status(400).send(JSON.stringify({success: false}));
                }
            }).catch((error) => {
                res.status(400).send(JSON.stringify({success: false, message: `${error}`}));
            });
        });

        app.post('/wallets/balance/', (req: Request, res: Response) => {
            var address : string = req.body.address;
            var coin : string = req.body.coin;
            var network : number;

            let api : CryptoAPI;

            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length)
            } else {
                network = 1;
            }

            switch(coin) {
                case 'BTC': api = new BitcoinAPI; break;
                case 'LTC': api = new LitecoinAPI; break;
                case 'DASH': api = new DashAPI; break;
                case 'ZEC': api = new ZCashAPI; break;
                case 'DOGE': api = new DogecoinAPI; break;
                default:
                    res.status(401).send(JSON.stringify({success: false}));
                    return;
            }

            api.getBalance(network, address).then(utxos => {
                if (utxos) {
                    res.status(200).send(JSON.stringify({success: true, response: JSON.stringify(utxos)}));
                } else {
                    res.status(400).send(JSON.stringify({success: false}));
                }
            }).catch((error) => {
                res.status(400).send(JSON.stringify({success: false, message: `${error}`}));
            });
        });

        app.post('/wallets/txFee/', (req: Request, res: Response) => {
            var coin : string = req.body.coin;
            var network : number;
            var inputs : number = req.body.inputs;
            var outputs : number = req.body.outputs;

            let api : CryptoAPI;

            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length)
            } else {
                network = 1;
            }

            switch(coin) {
                case 'BTC': api = new BitcoinAPI; break;
                case 'LTC': api = new LitecoinAPI; break;
                case 'DASH': api = new DashAPI; break;
                case 'ZEC': api = new ZCashAPI; break;
                case 'DOGE': api = new DogecoinAPI; break;
                default:
                    res.status(401).send(JSON.stringify({success: false}));
                    return;
            }

            api.getTransactionFee(network, inputs, outputs).then(fee => {
                if (fee >= 0) {
                    res.status(200).send(JSON.stringify({success: true, fee: fee}));
                } else {
                    res.status(400).send(JSON.stringify({success: false}));
                }
            }).catch((error) => {
                res.status(200).send(JSON.stringify({success: false, message: `${error}`}));
            });
        });

        app.post('/wallets/send/', (req: Request, res: Response) => {
            var coin : string = req.body.coin;
            var network : number;
            var fromAddress : string = req.body.fromAddress;
            var fromPrivateKey : string = req.body.fromPrivateKey;
            var toAddresses : string[] = req.body.toAddresses;
            var toAmounts : string[] = req.body.toAmounts;

            let api : CryptoAPI;

            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length)
            } else {
                network = 1;
            }

            switch(coin) {
                case 'BTC': api = new BitcoinAPI; break;
                case 'LTC': api = new LitecoinAPI; break;
                case 'DASH': api = new DashAPI; break;
                case 'ZEC': api = new ZCashAPI; break;
                case 'DOGE': api = new DogecoinAPI; break;
                default:
                    res.status(401).send(JSON.stringify({success: false}));
                    return;
            }

            api.send(network, fromAddress, fromPrivateKey, toAddresses, toAmounts).then(txReturn => {
                // TODO : handle errors
                res.status(200).send(JSON.stringify({success: true, txid: txReturn}));
            }).catch((error) => {
                res.status(200).send(JSON.stringify({success: false, message: `${error}`}));
            });
        });

        app.post('/wallets/createTransaction/', (req: Request, res: Response) => {
            var coin : string = req.body.coin;
            var network : number;
            var fromAddress : string = req.body.fromAddress;
            var fromPrivateKey : string = req.body.fromPrivateKey;
            var toAddresses : string[] = req.body.toAddresses;
            var toAmounts : string[] = req.body.toAmounts;
            var message : string = req.body.message;

            let api : CryptoAPI;

            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length)
            } else {
                network = 1;
            }

            switch(coin) {
                case 'BTC': api = new BitcoinAPI; break;
                case 'LTC': api = new LitecoinAPI; break;
                case 'DASH': api = new DashAPI; break;
                case 'ZEC': api = new ZCashAPI; break;
                case 'DOGE': api = new DogecoinAPI; break;
                default:
                    res.status(400).send(JSON.stringify({success: false}));
                    return;
            }
            
            var lSuccess : boolean;
            var lReturn : string;
            api.createTransactionHex(network, fromAddress, fromPrivateKey, toAddresses, toAmounts, message).then(txReturn => {
                // TODO : handle errors
                lReturn = txReturn;

                if (lReturn === "") {
                    lSuccess = false;
                } else {
                    lSuccess = true;
                }

                res.status(200).send(JSON.stringify({success: lSuccess, message: lReturn}));
                return;
            }).catch((error) => {
                console.log(`Error on createTransactionHex: ${error}`);
                res.status(200).send(JSON.stringify({success: false, message: `${error}`}));
            });
        });

        app.post('/wallets/sendRawTransaction/', (req: Request, res: Response) => {
            var coin : string = req.body.coin;
            var network : number;
            var rawTransactoinHex : string = req.body.tx

            let api : CryptoAPI;

            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length)
            } else {
                network = 1;
            }

            switch(coin) {
                case 'BTC': api = new BitcoinAPI; break;
                case 'LTC': api = new LitecoinAPI; break;
                case 'DASH': api = new DashAPI; break;
                case 'ZEC': api = new ZCashAPI; break;
                case 'DOGE': api = new DogecoinAPI; break;
                default:
                    res.status(400).send(JSON.stringify({success: false}));
                    return;
            }

            var lSuccess : boolean;
            var lTxid : string;

            api.sendTransactionHex(network, rawTransactoinHex).then(txReturn => {
                // TODO : handle errors
                lTxid = txReturn;

                if (lTxid === "") {
                    lSuccess = false;
                } else {
                    lSuccess = true;
                }

                res.status(200).send(JSON.stringify({success: lSuccess, txid: lTxid}));
            }).catch((error) => {
                res.status(200).send(JSON.stringify({success: false, message: `${error}`}));
            });
        });
    }
}