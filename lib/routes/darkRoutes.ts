import { Request, Response } from 'express'

import { DarkWallet } from '../api/DarkWalletAPI';
import { StringMath } from '../api/StringMath';
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
            res.status(200).send({message: "Testing..."});
        });

        app.post('/dark/createWallets/', (req: Request, res: Response) => {
            var darkWallet : DarkWallet = new DarkWallet();
            var stringMath : StringMath = new StringMath();
            var coin : string = req.body.coin;
            var amount : string = req.body.value;
            var owner : string = req.body.owner;
            var saveToDB : boolean = req.body.save;
            var coinPrefix : string;
            var network : number;
            var amountMinusFee : string;
            var breakEstimation : number = darkWallet.estimateBreaks(amount);
            var walletValues : string[];
            var walletReturn : any = new Object();

            if (saveToDB === null) {
                saveToDB = true;
            }

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

            api.getTransactionFee(network, 1, breakEstimation).then(ifee => {
                var fee : string = stringMath.roundUpToNearest0001(ifee);
                amountMinusFee = stringMath.subtract(amount, fee);
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

                    // save wallets to db...
                    if (saveToDB) {
                        darkWallet.saveMicroWallet(owner, wallet.address, splitKeys.server, splitKeys.user);
                    }
                }

                res.status(200).send({success: true, fee: fee, coin: (coinPrefix + coin), wallets: walletReturn})
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

        app.post('/dark/estimateBreaksAndFees/', (req: Request, res: Response) => {
            var inputAmount : string = req.body.amount;
            var coin : string = req.body.coin;
            var darkWallet : DarkWallet = new DarkWallet();
            var breakEstimate : number = darkWallet.estimateBreaks(inputAmount);
            var lSuccess : boolean = true;
            var network : number;

            if (breakEstimate <= 0) {
                lSuccess = false;
            }

            if (coin !== null) {
                let creatorApi : CryptoAPI;
                if (coin.charAt(0) === "t") {
                    network = 2;
                    coin = coin.substring(1, coin.length)
                } else {
                    network = 1;
                }
                switch(coin) {
                    case 'BTC': creatorApi = new BitcoinAPI; break;
                    case 'LTC': creatorApi = new LitecoinAPI; break;
                    case 'DASH': creatorApi = new DashAPI; break;
                    case 'ZEC': creatorApi = new ZCashAPI; break;
                    case 'DOGE': creatorApi = new DogecoinAPI; break;
                    default:
                    res.send(JSON.stringify({success: lSuccess, estimate: breakEstimate, feeEstimate: "-1"}));
                        return;
                }
                creatorApi.getTransactionFee(network, 2, breakEstimate).then(ifee => {
                    res.send(JSON.stringify({success: lSuccess, estimate: breakEstimate, feeEstimate: ifee}));
                });
            } else {
                res.send(JSON.stringify({success: lSuccess, estimate: breakEstimate, feeEstimate: "-1"}));
            }
        });

        app.post('/dark/send/', (req: Request, res: Response) => {
            var darkWallet : DarkWallet = new DarkWallet();
            var currentOwner : string = req.body.owner;
            var newOwner : string = req.body.newOwner;
            var uid : string[] = req.body.uid;
            var success : boolean;

            for (var i = 0; i < uid.length; i++) {
                if (!darkWallet.transferOwnershipOfMicroWallet(currentOwner, newOwner, uid[i])) {
                    success = darkWallet.revertTransfer(uid);
                    res.send(JSON.stringify({success: false, revert: success}));
                    return;
                }
            }

            success = darkWallet.confirmTransfer(uid);
            res.send(JSON.stringify({success: true, confirmed: success}));
        });

        app.post('/dark/checkOwnership/', (req: Request, res: Response) => {
            var darkWallet : DarkWallet = new DarkWallet();
            var owner : string = req.body.owner;
            var uid : string[] = req.body.uid;

            for (var i = 0; i < uid.length; i++) {
                if (!darkWallet.confirmOwnershipOfMicroWallet(owner, uid[i])) {
                    res.send(JSON.stringify({success: true, confirmation: false}));
                    return;
                }
            }
            res.send(JSON.stringify({success: true, confirmation: true}));
        });
    }
}