"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BitcoinAPI_1 = require("../api/BitcoinAPI");
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
                        // case 'LTC': api = new LitecoinAPI; break;
                        // case 'DASH': api = new DashAPI; break;
                        // case 'ZEC': api = new ZecAPI; break;
                        // case 'ETH': api = new EthAPI; break;
                        // case 'DOGE': api = new DogeAPI; break;
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
    }
}
exports.WalletRoutes = WalletRoutes;
//# sourceMappingURL=walletRoutes.js.map