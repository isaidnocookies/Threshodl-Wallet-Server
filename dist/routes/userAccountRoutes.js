"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAccount_1 = require("../api/UserAccount");
class UserAccountRoutes {
    routes(app) {
        app.route('/userAccount/').get((req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            userAccount.createAccountKeys("giant defense lens very flavor few poverty secret fitness lounge skirt grain");
            res.status(200).send({ message: "User account says, hello world!" });
        });
        app.post('/userAccount/create/', (req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            var lUsername = req.body.username;
            var lSeed = userAccount.createMnemonicWords();
            var lPrivateKey;
            var lPublicKey;
            var keys = userAccount.createAccountKeys(lSeed);
            lPrivateKey = keys[0];
            lPublicKey = keys[1];
            userAccount.createAccount(lUsername, lPublicKey, lPublicKey).then(success => {
                if (!success) {
                    lUsername = "";
                    lSeed = "";
                    lPrivateKey = "";
                    lPublicKey = "";
                }
                res.send(JSON.stringify({ success: success, username: lUsername, seed: lSeed, publicKey: lPublicKey, privateKey: lPrivateKey }));
            });
        });
        app.post('/userAccount/recover/', (req, res) => {
            var publicKey = req.body.publicKey;
        });
        app.post('/userAccount/accountExists/', (req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            var lUsername = req.body.username;
            userAccount.checkUsername(lUsername).then(isFound => {
                res.status(200).send(JSON.stringify({ success: isFound }));
            });
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