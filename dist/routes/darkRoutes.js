"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            // var saveToDB : boolean = req.body.save;
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
            api.getTransactionFee(network, 1, breakEstimation).then(ifee => {
                var fee = stringMath.roundUpToNearest0001(ifee);
                console.log("Rounded fee: " + fee + "     Old Fee: " + ifee);
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
                    var uid = darkWallet.getMicroWalletUID(wallet.address, coin);
                    walletReturn[i] = { address: wallet.address, uniqueid: uid, privateKey: splitKeys.user, value: walletValues[i] };
                    creatorApi = null;
                    // if (!darkWallet.saveMicroWallet(ownerId, uid, splitKeys.server, splitKeys.user)) {
                    //     res.status(200).send({success: false});
                    //     return;
                    // }
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
        app.post('/dark/completeWallets/', (req, res) => {
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            var userAccount = new UserAccount_1.UserAccount();
            var owner = req.body.ownerId;
            var uid = req.body.uid;
            var walletReturn = new Object();
            var authMessage = req.body.message;
            var password = req.body.password;
            var success = true;
            userAccount.authenticateRequest(owner, authMessage, password).then((confirmed) => __awaiter(this, void 0, void 0, function* () {
                if (confirmed) {
                    for (var i = 0; i < uid.length; i++) {
                        try {
                            var completedWallet = yield darkWallet.getMicroWallet(uid[i]);
                            if (completedWallet.success) {
                                walletReturn[uid[i]] = { uid: completedWallet.uid, owner: completedWallet.owner, privatekey: completedWallet.privatekey, secretkey: completedWallet.secretkey };
                                if (!darkWallet.completeMicroWallet(uid[i])) {
                                    success = false;
                                }
                            }
                        }
                        catch (_a) {
                            success = false;
                        }
                    }
                    if (success) {
                        res.send(JSON.stringify({ success: true, wallets: walletReturn }));
                    }
                    else {
                        for (var i = 0; i < uid.length; i++) {
                            try {
                                if (!darkWallet.revertCompleteMicroWallet(uid[i])) {
                                    console.log("Failed to revert changes.. " + uid);
                                }
                            }
                            catch (_b) {
                                console.log("Failed to revert changes and was caught.. " + uid);
                            }
                        }
                    }
                }
                else {
                    res.send(JSON.stringify({ success: false, message: "Failed to authenticate" }));
                }
            })).catch(() => {
                res.send(JSON.stringify({ success: false, message: "Failed to authenticate" }));
            });
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