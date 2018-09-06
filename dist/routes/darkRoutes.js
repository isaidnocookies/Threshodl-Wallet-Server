"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DarkWalletAPI_1 = require("../api/DarkWalletAPI");
const BitcoinAPI_1 = require("../api/BitcoinAPI");
const ZCashAPI_1 = require("../api/ZCashAPI");
const LitecoinAPI_1 = require("../api/LitecoinAPI");
const DashAPI_1 = require("../api/DashAPI");
const DogecoinAPI_1 = require("../api/DogecoinAPI");
class DarkRoutes {
    routes(app) {
        app.route('/dark/').get((req, res) => {
            res.status(200).send({ message: "Dark hello world!" });
        });
        app.post('/dark/', (req, res) => {
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            var uid = req.body.uid;
            darkWallet.returnMicroWalletAndDelete(uid).then(wallet => {
                console.log(wallet);
                res.status(200).send({ message: "Testing.... passed" });
            }).catch(err => {
                console.log(err);
                res.status(200).send({ message: "Testing.... failed" });
            });
            // darkWallet.deleteMicroWallet(uid).then(success => {
            //     if (success) {
            //         console.log("Delete Successful!")
            //     } else {
            //         console.log("Delete Failed...");
            //     }
            //     res.status(200).send({message: "Testing...."})
            // });
            // res.status(200).send({values: darkWallet.getBreakValues(req.body.value)})
        });
        app.post('/dark/createWallets/', (req, res) => {
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            var coin = req.body.coin;
            var amount = req.body.value;
            var owner = req.body.owner;
            var coinPrefix;
            var network;
            var amountMinusFee;
            var breakEstimation = darkWallet.estimateBreaks(amount);
            var walletValues;
            var walletReturn = new Object();
            let api;
            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length);
                coinPrefix = "t";
            }
            else {
                network = 1;
                coinPrefix = "";
            }
            switch (coin) {
                case 'BTC':
                    api = new BitcoinAPI_1.BitcoinAPI;
                    break;
                case 'LTC':
                    api = new LitecoinAPI_1.LitecoinAPI;
                    break;
                case 'DASH':
                    api = new DashAPI_1.DashAPI;
                    break;
                case 'ZEC':
                    api = new ZCashAPI_1.ZCashAPI;
                    break;
                case 'DOGE':
                    api = new DogecoinAPI_1.DogecoinAPI;
                    break;
                default:
                    res.status(401).send(JSON.stringify({ success: false }));
                    return;
            }
            api.getTransactionFee(network, 1, breakEstimation).then(fee => {
                amountMinusFee = (parseFloat(amount) - parseFloat(fee)).toString();
                walletValues = darkWallet.getBreakValues(amountMinusFee);
                for (var i = 0; i < walletValues.length; i++) {
                    let creatorApi;
                    switch (coin) {
                        case 'BTC':
                            creatorApi = new BitcoinAPI_1.BitcoinAPI;
                            break;
                        case 'LTC':
                            creatorApi = new LitecoinAPI_1.LitecoinAPI;
                            break;
                        case 'DASH':
                            creatorApi = new DashAPI_1.DashAPI;
                            break;
                        case 'ZEC':
                            creatorApi = new ZCashAPI_1.ZCashAPI;
                            break;
                        case 'DOGE':
                            creatorApi = new DogecoinAPI_1.DogecoinAPI;
                            break;
                        default:
                            res.status(401).send(JSON.stringify({ success: false }));
                            return;
                    }
                    var wallet = creatorApi.createWallet(network, "");
                    var splitKeys = darkWallet.splitPrivateKey(wallet.privateKey.toString());
                    walletReturn[i] = { address: wallet.address, privateKey: splitKeys.user, value: walletValues[i] };
                    creatorApi = null;
                    // save wallets to db...
                    darkWallet.saveMicroWallet(owner, wallet.address, splitKeys.server, splitKeys.user);
                }
                res.status(200).send({ success: true, coin: (coinPrefix + coin), wallets: walletReturn });
            });
        });
        app.post('/dark/getBreaks/', (req, res) => {
            var inputAmount = req.body.amount;
            var breaks;
            var lSuccess = true;
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            breaks = darkWallet.getBreakValues(inputAmount);
            res.send(JSON.stringify({ success: lSuccess, values: breaks }));
        });
        app.post('/dark/estimateBreaks/', (req, res) => {
            var inputAmount = req.body.amount;
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            var breakEstimate = darkWallet.estimateBreaks(inputAmount);
            var lSuccess = true;
            if (breakEstimate <= 0) {
                lSuccess = false;
            }
            res.send(JSON.stringify({ success: lSuccess, estimate: breakEstimate }));
        });
        app.post('/dark/send/', (req, res) => {
            res.send(JSON.stringify({ success: false }));
        });
        app.post('/dark/checkOwnership/', (req, res) => {
            res.send(JSON.stringify({ success: false }));
        });
        app.post('/dark/claimWallets/', (req, res) => {
            res.send(JSON.stringify({ success: false }));
        });
    }
}
exports.DarkRoutes = DarkRoutes;
//# sourceMappingURL=darkRoutes.js.map