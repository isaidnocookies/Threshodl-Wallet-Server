import { Request, Response } from 'express'

import { DarkWallet } from '../api/DarkWalletAPI';
import { UserAccount } from '../api/UserAccount';
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
            var ownerId : string = req.body.ownerId;
            var saveToDB : boolean = req.body.save;
            var coinPrefix : string;
            var network : number;
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

                    if (!darkWallet.saveMicroWallet(ownerId, wallet.address, splitKeys.server, splitKeys.user)) {
                        res.status(200).send({success: false});
                        return;
                    }
                }
                res.status(200).send({success: true, fee: fee, coin: (coinPrefix + coin), wallets: walletReturn});
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

                if (coin.charAt(0) === "d") {
                    coin = coin.substring(1);
                }

                if (coin.charAt(0) === "t") {
                    network = 2;
                    coin = coin.substring(1);
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
                    res.send(JSON.stringify({success: false, estimate: breakEstimate, feeEstimate: "-1"}));
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
            var userAccount : UserAccount = new UserAccount();
            var currentOwner : string = req.body.ownerId;
            var newOwner : string = req.body.newOwnerUsername;
            var uid : string[] = req.body.uid;
            var success : boolean;

            var authMessage : string = req.body.message;
            var password : string = req.body.password;

            userAccount.authenticateRequest(currentOwner, authMessage, password).then(confirmed => {
                if (confirmed) {
                    for (var i = 0; i < uid.length; i++) {
                        try{
                            if (!darkWallet.transferOwnershipOfMicroWallet(currentOwner, newOwner, uid[i])) {
                                console.log("Failed to complete transfer...");
                                success = darkWallet.revertTransfer(uid);
                                res.send(JSON.stringify({success: false, revert: success}));
                                return;
                            }
                        } catch {
                            console.log("Error thrown while in complete transfer...");
                            success = darkWallet.revertTransfer(uid);
                            res.send(JSON.stringify({success: false, revert: success}));
                            return;
                        }
                    }
                    console.log("Successfully transferred ownership");
                    success = darkWallet.confirmTransfer(uid);
                    res.send(JSON.stringify({success: true, confirmed: success}));
                } else {
                    res.send(JSON.stringify({success: false, message: "Failed to authenticate"}));
                }
            }).catch(() => {
                res.send(JSON.stringify({success: false, message: "Failed to authenticate"}));
            });
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