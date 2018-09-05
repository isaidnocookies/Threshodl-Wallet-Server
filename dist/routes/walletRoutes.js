"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BitcoinAPI_1 = require("../api/BitcoinAPI");
const ZCashAPI_1 = require("../api/ZCashAPI");
const LitecoinAPI_1 = require("../api/LitecoinAPI");
const DashAPI_1 = require("../api/DashAPI");
const DogecoinAPI_1 = require("../api/DogecoinAPI");
class WalletRoutes {
    routes(app) {
        app.route('/wallets/').get((req, res) => {
            res.status(200).send({ message: "Wallets api ping" });
        });
        app.post('/wallets/testing/', (req, res) => {
            res.status(200).send({ message: "Wallet testing call" });
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
                    res.status(200).send(JSON.stringify({ success: true, response: JSON.stringify(utxos) }));
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
            api.getBalance(network, address).then(utxos => {
                if (utxos) {
                    res.status(200).send(JSON.stringify({ success: true, response: JSON.stringify(utxos) }));
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
        app.post('/wallets/send/', (req, res) => {
            var coin = req.body.coin;
            var network;
            var fromAddress = req.body.fromAddress;
            var fromPrivateKey = req.body.fromPrivateKey;
            var toAddresses = req.body.toAddresses;
            var toAmounts = req.body.toAmounts;
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
            api.send(network, fromAddress, fromPrivateKey, toAddresses, toAmounts).then(txReturn => {
                // TODO : handle errors
                res.status(200).send(JSON.stringify({ success: true, txid: txReturn }));
            }).catch((error) => {
                res.status(200).send(JSON.stringify({ success: false, message: `${error}` }));
            });
        });
        app.post('/wallets/createTransaction/', (req, res) => {
            var coin = req.body.coin;
            var network;
            var fromAddress = req.body.fromAddress;
            var fromPrivateKey = req.body.fromPrivateKey;
            var toAddresses = req.body.toAddresses;
            var toAmounts = req.body.toAmounts;
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
            api.createTransactionHex(network, fromAddress, fromPrivateKey, toAddresses, toAmounts, message).then(txReturn => {
                // TODO : handle errors
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
                // TODO : handle errors
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