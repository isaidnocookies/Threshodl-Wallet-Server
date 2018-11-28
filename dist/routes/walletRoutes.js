"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BitcoinAPI_1 = require("../api/BitcoinAPI");
const ZCashAPI_1 = require("../api/ZCashAPI");
const LitecoinAPI_1 = require("../api/LitecoinAPI");
const DashAPI_1 = require("../api/DashAPI");
const DogecoinAPI_1 = require("../api/DogecoinAPI");
var StringMath = require('@isaidnocookies/StringMath');
class WalletRoutes {
    routes(app) {
        app.route('/wallets/').get((req, res) => {
            res.status(200).send({ message: "Wallets api ping" });
        });
        app.post('/wallets/create/', (req, res) => {
            let api;
            var coins = req.body.coins;
            var seed = req.body.seed;
            var numberOfCoins = coins.length;
            var newWallets = new Object();
            if (numberOfCoins <= 0) {
                res.send(JSON.stringify({ success: false, message: "No coins specified" }));
            }
            else {
                for (var i = 0; i < numberOfCoins; i++) {
                    var coin = coins[i];
                    var theCoinPrefix;
                    var network;
                    if (coin.charAt(0) === "t") {
                        network = 2;
                        coin = coin.substring(1, coin.length);
                        theCoinPrefix = "t";
                    }
                    else {
                        network = 1;
                        theCoinPrefix = "";
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
                            newWallets[coin] = { "address": "", "privateKey": "", "wif": "", "fromSeed": false };
                            continue;
                    }
                    newWallets[theCoinPrefix + coin] = api.createWallet(network, seed);
                    api = null;
                }
            }
            res.status(200).send(JSON.stringify({ success: true, message: newWallets }));
        });
        app.post('/wallets/utxos/', (req, res) => {
            var address = req.body.address;
            var amount = req.body.amount;
            var coin = req.body.coin;
            var network;
            let api;
            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length);
            }
            else {
                network = 1;
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
            api.getUnspentTransactions(network, address, amount).then(utxos => {
                if (utxos) {
                    res.status(200).send(JSON.stringify({ success: true, response: utxos }));
                }
                else {
                    res.status(400).send(JSON.stringify({ success: false }));
                }
            }).catch((error) => {
                res.status(400).send(JSON.stringify({ success: false, message: `${error}` }));
            });
        });
        app.post('/wallets/balance/', (req, res) => {
            var address = req.body.address;
            var coin = req.body.coin;
            var network;
            var stringmath = new StringMath();
            let api;
            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length);
            }
            else {
                network = 1;
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
            api.getBalance(network, address).then(balance => {
                var returnBalance = balance;
                if (balance && balance.confirmed !== -1) {
                    if ((balance.confirmed.toString()).indexOf("e") >= 0) {
                        returnBalance.confirmed = stringmath.sciToDecimal(balance.confirmed.toString());
                    }
                    else {
                        returnBalance.confirmed = balance.confirmed.toString();
                    }
                    if ((balance.unconfirmed.toString()).indexOf("e") >= 0) {
                        returnBalance.unconfirmed = stringmath.sciToDecimal(balance.unconfirmed.toString());
                    }
                    else {
                        returnBalance.unconfirmed = balance.unconfirmed.toString();
                    }
                    res.status(200).send(JSON.stringify({ success: true, response: returnBalance }));
                }
                else {
                    res.status(400).send(JSON.stringify({ success: false }));
                }
            }).catch((error) => {
                res.status(400).send(JSON.stringify({ success: false, message: `${error}` }));
            });
        });
        app.post('/wallets/txFee/', (req, res) => {
            var coin = req.body.coin;
            var network;
            var inputs = req.body.inputs;
            var outputs = req.body.outputs;
            let api;
            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length);
            }
            else {
                network = 1;
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
            api.getTransactionFee(network, inputs, outputs).then(fee => {
                if (fee >= 0) {
                    res.status(200).send(JSON.stringify({ success: true, fee: fee }));
                }
                else {
                    res.status(400).send(JSON.stringify({ success: false }));
                }
            }).catch((error) => {
                res.status(200).send(JSON.stringify({ success: false, message: `${error}` }));
            });
        });
        app.post('/wallets/createTransaction/', (req, res) => {
            var coin = req.body.coin;
            var network;
            var fromAddresses = req.body.fromAddresses;
            var fromPrivateKeys = req.body.fromPrivateKeys;
            var toAddresses = req.body.toAddresses;
            var toAmounts = req.body.toAmounts;
            var returnAddress = req.body.returnAddress;
            var fee = req.body.fee;
            var message = req.body.message;
            let api;
            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length);
            }
            else {
                network = 1;
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
                    res.status(400).send(JSON.stringify({ success: false }));
                    return;
            }
            var lSuccess;
            var lReturn;
            if (!fee || fee === "-1") {
                fee = "";
            }
            api.createTransactionHex(network, fromAddresses, fromPrivateKeys, toAddresses, toAmounts, returnAddress, fee, message).then(txReturn => {
                lReturn = txReturn;
                if (lReturn === "") {
                    lSuccess = false;
                }
                else {
                    lSuccess = true;
                }
                res.status(200).send(JSON.stringify({ success: lSuccess, message: lReturn }));
                return;
            }).catch((error) => {
                console.log(`Error on createTransactionHex: ${error}`);
                res.status(200).send(JSON.stringify({ success: false, message: `${error}` }));
            });
        });
        app.post('/wallets/sendRawTransaction/', (req, res) => {
            var coin = req.body.coin;
            var network;
            var rawTransactoinHex = req.body.tx;
            let api;
            if (coin.charAt(0) === "t") {
                network = 2;
                coin = coin.substring(1, coin.length);
            }
            else {
                network = 1;
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
                    res.status(400).send(JSON.stringify({ success: false }));
                    return;
            }
            var lSuccess;
            var lTxid;
            api.sendTransactionHex(network, rawTransactoinHex).then(txReturn => {
                lTxid = txReturn;
                if (lTxid === "") {
                    lSuccess = false;
                }
                else {
                    lSuccess = true;
                }
                res.status(200).send(JSON.stringify({ success: lSuccess, txid: lTxid }));
            }).catch((error) => {
                res.status(200).send(JSON.stringify({ success: false, message: `${error}` }));
            });
        });
    }
}
exports.WalletRoutes = WalletRoutes;
//# sourceMappingURL=walletRoutes.js.map