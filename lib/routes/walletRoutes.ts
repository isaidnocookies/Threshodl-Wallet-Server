import { Request, Response } from 'express';
import * as express from 'express';

import { CryptoAPI } from "../api/CryptoAPI";

import { BitcoinAPI, Network } from "../api/BitcoinAPI";
import { ZCashAPI } from "../api/ZCashAPI";
import { LitecoinAPI } from "../api/LitecoinAPI";
import { DashAPI } from "../api/DashAPI";
import { DogecoinAPI } from "../api/DogecoinAPI";

export class WalletRoutes {
    public routes (app) : any {
        app.route('/wallets/').get((req: Request, res: Response) => {
            res.status(200).send({message: "Wallets api ping"})
        })

        app.post('/wallets/create/', (req: Request, res: Response) => {
            let api : CryptoAPI;

            var coins : string[] = req.body.coins;
            var seed : string = req.body.seed;
            var numberOfCoins : number = coins.length;
            var network : number = req.body.network;

            if (numberOfCoins <= 0) {
                res.send(JSON.stringify({success: false, message: "No coins specified"}));
            } else {
                var newWallets = new Object();
                for (var i = 0; i < numberOfCoins; i++) {
                    var coin = coins[i];

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

                    newWallets[coin] = api.createWallet(network, seed);
                    api = null;
                }
            }
            res.status(200).send(JSON.stringify({success: true, message: newWallets}));
        });

        app.post('/wallets/utxos/', (req: Request, res: Response) => {
            var address : string = req.body.address;
            var amount : string =  req.body.amount;
            var coin : string = req.body.coin;
            var network : number = req.body.network;

            let api : CryptoAPI;

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

            return api.getUnspentTransactions(network, address, amount).then(utxos => {
                if (utxos) {
                    res.status(200).send(JSON.stringify({success: true, response: JSON.stringify(utxos)}));
                } else {
                    res.status(400).send(JSON.stringify({success: false}));
                }
            });
        });

        app.post('/wallets/balance/', (req: Request, res: Response) => {
            var address : string = req.body.address;
            var coin : string = req.body.coin;
            var network : number = req.body.network;

            let api : CryptoAPI;

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

            return api.getBalance(network, address).then(utxos => {
                if (utxos) {
                    res.status(200).send(JSON.stringify({success: true, response: JSON.stringify(utxos)}));
                } else {
                    res.status(400).send(JSON.stringify({success: false}));
                }
            });
        });

        app.post('/wallets/txFee/', (req: Request, res: Response) => {
            var coin : string = req.body.coin;
            var network : number = req.body.network;

            let api : CryptoAPI;

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

            return api.getTransactionFee(network, 1, 1).then(fee => {
                if (fee >= 0) {
                    res.status(200).send(JSON.stringify({success: true, fee: fee}));
                } else {
                    res.status(400).send(JSON.stringify({success: false}));
                }
            });
        });

        app.post('/wallets/send/', (req: Request, res: Response) => {
            var coin : string = req.body.coin;
            var network : number = req.body.network;
            var fromAddress : string = req.body.fromAddress;
            var fromPrivateKey : string = req.body.fromPrivateKey;
            var toAddresses : string[] = req.body.toAddresses;
            var toAmounts : string[] = req.body.toAmounts;

            let api : CryptoAPI;

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

            return api.send(network, fromAddress, fromPrivateKey, toAddresses, toAmounts).then(txReturn => {
                // TODO : handle errors
                res.status(200).send(JSON.stringify({success: true, txid: txReturn}));
            });
        });

        app.post('/wallets/createTransaction/', (req: Request, res: Response) => {
            var coin : string = req.body.coin;
            var network : number = req.body.network;
            var fromAddress : string = req.body.fromAddress;
            var fromPrivateKey : string = req.body.fromPrivateKey;
            var toAddresses : string[] = req.body.toAddresses;
            var toAmounts : string[] = req.body.toAmounts;
            var message : string = req.body.message;

            let api : CryptoAPI;

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
            return api.createTransactionHex(network, fromAddress, fromPrivateKey, toAddresses, toAmounts, message).then(txReturn => {
                // TODO : handle errors
                lReturn = txReturn;

                if (lReturn === "") {
                    lSuccess = false;
                } else {
                    lSuccess = true;
                }

                res.status(200).send(JSON.stringify({success: lSuccess, message: lReturn}));
            });
        });

        app.post('/wallets/sendRawTransaction/', (req: Request, res: Response) => {
            var coin : string = req.body.coin;
            var network : number = req.body.network;
            var rawTransactoinHex : string = req.body.tx

            let api : CryptoAPI;

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

            return api.sendTransactionHex(network, rawTransactoinHex).then(txReturn => {
                // TODO : handle errors
                lTxid = txReturn;

                if (lTxid === "") {
                    lSuccess = false;
                } else {
                    lSuccess = true;
                }

                res.status(200).send(JSON.stringify({success: lSuccess, txid: lTxid}));
            });
        });
    }
}