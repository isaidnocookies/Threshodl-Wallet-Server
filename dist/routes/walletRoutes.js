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
        app.post('/wallets/create/', (req, res) => {
            let api;
            var coins = req.body.coins;
            var seed = req.body.seed;
            var numberOfCoins = coins.length;
            if (numberOfCoins <= 0) {
                res.send(JSON.stringify({ success: false, message: "No coins specified" }));
            }
            else {
                var newWallets = new Object();
                for (var i = 0; i < numberOfCoins; i++) {
                    var coin = coins[i];
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
                    newWallets[coin] = api.createWallet(BitcoinAPI_1.Network.Testnet, seed);
                    api = null;
                }
            }
            res.status(200).send(JSON.stringify({ success: true, message: newWallets }));
        });
        app.post('/wallets/utxos/', (req, res) => {
            var addresses = req.body.addresses;
            var address = req.body.address;
            var amount = req.body.amount;
            var coin = req.body.coin;
            let api;
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
            return api.getUnspentTransactions(address, amount).then(utxos => {
                if (utxos) {
                    res.status(200).send(JSON.stringify({ success: true, response: JSON.stringify(utxos) }));
                }
                else {
                    res.status(400).send(JSON.stringify({ success: false }));
                }
            });
        });
        app.post('/wallets/testing/', (req, res) => {
            res.status(200).send(JSON.stringify({ success: true, response: "testing.." }));
        });
    }
}
exports.WalletRoutes = WalletRoutes;
//# sourceMappingURL=walletRoutes.js.map