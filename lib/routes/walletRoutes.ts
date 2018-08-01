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

                    newWallets[coin] = api.createWallet(Network.Testnet, seed);
                    api = null;
                }
            }
            res.status(200).send(JSON.stringify({success: true, message: newWallets}));
        });

        app.post('/wallets/utxos/', (req: Request, res: Response) => {
            var address : string = req.body.address;
            var amount : string =  req.body.amount;
            var coin : string = req.body.coin;

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

            return api.getUnspentTransactions(address, amount).then(utxos => {
                if (utxos) {
                    res.status(200).send(JSON.stringify({success: true, response: JSON.stringify(utxos)}));
                } else {
                    res.status(400).send(JSON.stringify({success: false}));
                }
            });
        });

        app.post('/wallets/testing/', (req: Request, res: Response) => {
            res.status(200).send(JSON.stringify({success: true, response: "testing.."}));
        });
    }
}