"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAccount_1 = require("../api/UserAccount");
class UserAccountRoutes {
    routes(app) {
        app.route('/userAccount/').get((req, res) => {
            res.status(200).send({ message: "User account says, hello world!" });
        });
        app.post('/userAccount/create/', (req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            // Validate Username
            // TODO:
            // Create Seed
            var seed = userAccount.createMnemonicWords();
            // Create Private Key and Public Key
            // Return useraccount information
            res.send(JSON.stringify({ success: false, username: "", seed: seed }));
        });
        app.post('/userAccount/signMessage/', (req, res) => {
            // TODO...
            res.send(JSON.stringify({ success: false, signature: "" }));
        });
        app.post('/userAccount/mnemonicSeed/', (req, res) => {
            let userAccountApi = new UserAccount_1.UserAccount;
            var seed = userAccountApi.createMnemonicWords();
            userAccountApi = null;
            res.send(JSON.stringify({ success: true, seed: seed }));
        });
    }
}
exports.UserAccountRoutes = UserAccountRoutes;
//# sourceMappingURL=userAccountRoutes.js.map