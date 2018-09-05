import { Request, Response } from 'express'

import { DarkWallet } from '../api/DarkWalletAPI';
import { CryptoAPI } from "../api/CryptoAPI";

import { BitcoinAPI } from "../api/BitcoinAPI";
import { ZCashAPI } from "../api/ZCashAPI";
import { LitecoinAPI } from "../api/LitecoinAPI";
import { DashAPI } from "../api/DashAPI";
import { DogecoinAPI } from "../api/DogecoinAPI";

export class DarkRoutes {
    public routes (app) : any {
        app.route('/dark/').get((req: Request, res: Response) => {
            res.status(200).send({message: "Dark hello world!"})
        })

        app.post('/dark/', (req: Request, res: Response) => {
            var darkWallet : DarkWallet = new DarkWallet();
            res.status(200).send({values: darkWallet.getBreakValues(req.body.value)})
        });

        app.post('/dark/createWallets/', (req: Request, res: Response) => {
            var darkWallet : DarkWallet = new DarkWallet();
            var coin : string = req.body.coin;
            var coinPrefix : string;
            var network : number;
            var amount : string = req.body.value;
            var amountMinusFee : string;
            var breakEstimation : number = darkWallet.estimateBreaks(amount);
            var walletValues : string[];
            var walletReturn : any = new Object();

            let api : CryptoAPI;

            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length)
                coinPrefix = "t";
            } else {
                network = 1;
                coinPrefix = "";
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

            api.getTransactionFee(network, 1, breakEstimation).then(fee => {
                amountMinusFee = (parseFloat(amount) - parseFloat(fee)).toString();
                walletValues = darkWallet.getBreakValues(amountMinusFee);
    
                for (var i = 0; i < walletValues.length; i++) {
                    let creatorApi : CryptoAPI;

                    switch(coin) {
                        case 'BTC': creatorApi = new BitcoinAPI; break;
                        case 'LTC': creatorApi = new LitecoinAPI; break;
                        case 'DASH': creatorApi = new DashAPI; break;
                        case 'ZEC': creatorApi = new ZCashAPI; break;
                        case 'DOGE': creatorApi = new DogecoinAPI; break;
                        default:
                            res.status(401).send(JSON.stringify({success: false}));
                            return;
                    }

                    var wallet : any = creatorApi.createWallet(network, "");
                    var splitKeys : any = darkWallet.splitPrivateKey(wallet.privateKey.toString());

                    walletReturn[i] = {address: wallet.address, privateKey: splitKeys.user, value: walletValues[i]};
                    creatorApi = null;
                }

                // save wallets to db...
                
                res.status(200).send({success: true, coin: (coinPrefix + coin), wallets: walletReturn})
            });
        });

        app.post('/dark/getBreaks/', (req: Request, res: Response) => {
            var inputAmount : string = req.body.amount;
            var breaks : string[];
            var lSuccess : boolean = true;

            var darkWallet : DarkWallet = new DarkWallet();

            breaks = darkWallet.getBreakValues(inputAmount);

            res.send(JSON.stringify({success: lSuccess, values: breaks}));
        });

        app.post('/dark/estimateBreaks/', (req: Request, res: Response) => {
            var inputAmount : string = req.body.amount;
            var darkWallet : DarkWallet = new DarkWallet();
            var breakEstimate : number = darkWallet.estimateBreaks(inputAmount);
            var lSuccess : boolean = true;

            if (breakEstimate <= 0) {
                lSuccess = false;
            }

            res.send(JSON.stringify({success: lSuccess, estimate: breakEstimate}));
        });

        app.post('/dark/send/', (req: Request, res: Response) => {
            res.send(JSON.stringify({success: false}));
        });

        app.post('/dark/checkOwnership/', (req: Request, res: Response) => {
            res.send(JSON.stringify({success: false}));
        });

        app.post('/dark/claimWallets/', (req: Request, res: Response) => {
            res.send(JSON.stringify({success: false}));
        });
    }
}