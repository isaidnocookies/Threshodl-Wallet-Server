"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DarkRoutes {
    routes(app) {
        app.route('/dark/').get((req, res) => {
            res.status(200).send({ message: "Dark hello world!" });
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