"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DarkWalletAPI_1 = require("../api/DarkWalletAPI");
class DarkRoutes {
    routes(app) {
        app.route('/dark/').get((req, res) => {
            res.status(200).send({ message: "Dark hello world!" });
        });
        app.post('/dark/', (req, res) => {
            var darkWallet = new DarkWalletAPI_1.DarkWallet();
            res.status(200).send({ value: darkWallet.getBreakValues(req.body.value) });
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