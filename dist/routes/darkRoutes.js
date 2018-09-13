"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DarkWalletAPI_1 = require("../api/DarkWalletAPI");
const UserAccount_1 = require("../api/UserAccount");
const StringMath_1 = require("../api/StringMath");
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
            res.status(200).send({ message: "Testing..." });
        });
        app.post('/dark/createWallets/', (req, res) => {
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            var stringMath = new StringMath_1.StringMath();
            var coin = req.body.coin;
            var amount = req.body.value;
            var ownerId = req.body.ownerId;
            var saveToDB = req.body.save;
            var coinPrefix;
            var network;
            var amountMinusFee;
            var breakEstimation = darkWallet.estimateBreaks(amount);
            var walletValues;
            var walletReturn = new Object();
            if (saveToDB === null) {
                saveToDB = true;
            }
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
            api.getTransactionFee(network, 1, breakEstimation).then(ifee => {
                var fee = stringMath.roundUpToNearest0001(ifee);
                amountMinusFee = stringMath.subtract(amount, fee);
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
                    if (saveToDB) {
                        darkWallet.saveMicroWallet(ownerId, wallet.address, splitKeys.server, splitKeys.user);
                    }
                }
                res.status(200).send({ success: true, fee: fee, coin: (coinPrefix + coin), wallets: walletReturn });
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
        app.post('/dark/estimateBreaksAndFees/', (req, res) => {
            var inputAmount = req.body.amount;
            var coin = req.body.coin;
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            var breakEstimate = darkWallet.estimateBreaks(inputAmount);
            var lSuccess = true;
            var network;
            if (breakEstimate <= 0) {
                lSuccess = false;
            }
            if (coin !== null) {
                let creatorApi;
                if (coin.charAt(0) === "d") {
                    coin = coin.substring(1);
                }
                if (coin.charAt(0) === "t") {
                    network = 2;
                    coin = coin.substring(1);
                }
                else {
                    network = 1;
                }
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
                        res.send(JSON.stringify({ success: false, estimate: breakEstimate, feeEstimate: "-1" }));
                        return;
                }
                creatorApi.getTransactionFee(network, 2, breakEstimate).then(ifee => {
                    res.send(JSON.stringify({ success: lSuccess, estimate: breakEstimate, feeEstimate: ifee }));
                });
            }
            else {
                res.send(JSON.stringify({ success: lSuccess, estimate: breakEstimate, feeEstimate: "-1" }));
            }
        });
        app.post('/dark/send/', (req, res) => {
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            var userAccount = new UserAccount_1.UserAccount();
            var currentOwner = req.body.ownerId;
            var newOwner = req.body.newOwnerUsername;
            var uid = req.body.uid;
            var success;
            var authMessage = req.body.message;
            var password = req.body.password;
            userAccount.authenticateRequest(currentOwner, authMessage, password).then(confirmed => {
                if (confirmed) {
                    for (var i = 0; i < uid.length; i++) {
                        try {
                            if (!darkWallet.transferOwnershipOfMicroWallet(currentOwner, newOwner, uid[i])) {
                                console.log("Failed to complete transfer...");
                                success = darkWallet.revertTransfer(uid);
                                res.send(JSON.stringify({ success: false, revert: success }));
                                return;
                            }
                        }
                        catch (_a) {
                            console.log("Error thrown while in complete transfer...");
                            success = darkWallet.revertTransfer(uid);
                            res.send(JSON.stringify({ success: false, revert: success }));
                            return;
                        }
                    }
                    console.log("Successfully transferred ownership");
                    success = darkWallet.confirmTransfer(uid);
                    res.send(JSON.stringify({ success: true, confirmed: success }));
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "Failed to authenticate" }));
                }
            }).catch(() => {
                res.send(JSON.stringify({ success: false, message: "Failed to authenticate" }));
            });
        });
        app.post('/dark/checkOwnership/', (req, res) => {
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            var owner = req.body.owner;
            var uid = req.body.uid;
            for (var i = 0; i < uid.length; i++) {
                if (!darkWallet.confirmOwnershipOfMicroWallet(owner, uid[i])) {
                    res.send(JSON.stringify({ success: true, confirmation: false }));
                    return;
                }
            }
            res.send(JSON.stringify({ success: true, confirmation: true }));
        });
    }
}
exports.DarkRoutes = DarkRoutes;
//# sourceMappingURL=darkRoutes.js.map