"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAccount_1 = require("../api/UserAccount");
class UserAccountRoutes {
    routes(app) {
        app.route('/userAccount/').get((req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            res.status(200).send({ message: "User account says, hello world!" });
        });
        app.post('/userAccount/', (req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            userAccount.authenticateRequest(req.body.username, req.body.message, req.body.password).then(passed => {
                res.status(200).send({ success: passed, message: "Testing auth function..." });
            });
        });
        app.post('/userAccount/create/', (req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            var lUsername = req.body.username;
            console.log("Creating user...");
            var lSeed = userAccount.createMnemonicWords();
            var keys = userAccount.createAccountKeys(lSeed);
            var lPrivateKey = lPrivateKey = keys[0];
            var lPublicKey = lPublicKey = keys[1];
            console.log("About to save user to db");
            userAccount.createAccount(lUsername, lPublicKey, lPublicKey).then(success => {
                if (!success) {
                    lUsername = "";
                    lSeed = "";
                    lPrivateKey = "";
                    lPublicKey = "";
                }
                res.send(JSON.stringify({ success: success, username: lUsername, seed: lSeed, publickey: lPublicKey, privatekey: lPrivateKey }));
            }).catch((error) => {
                res.send(JSON.stringify({ success: false, message: `${error}` }));
            });
        });
        app.post('/userAccount/recover/', (req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            var lSeed = req.body.seed;
            var keys = userAccount.createAccountKeys(lSeed);
            var lPrivateKey = lPrivateKey = keys[0];
            var lPublicKey = lPublicKey = keys[1];
            var success;
            console.log("Recovering Account...");
            // //Testing and avoiding the account recovery for username...
            // res.send(JSON.stringify({success: true, username: "username", seed: lSeed, publicKey: lPublicKey, privateKey: lPrivateKey}));
            // return;
            userAccount.getUsername(lPublicKey).then(username => {
                if (username.length <= 0) {
                    success = false;
                    lSeed = "";
                    keys = "";
                    lPrivateKey = "";
                    lPublicKey = "";
                }
                else {
                    success = true;
                }
                res.send(JSON.stringify({ success: success, username: username, seed: lSeed, publicKey: lPublicKey, privateKey: lPrivateKey }));
            }).catch((error) => {
                res.send(JSON.stringify({ success: false, message: `${error}` }));
            });
        });
        app.post('/userAccount/accountExists/', (req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            var lUsername = req.body.username;
            userAccount.checkUsername(lUsername).then(isFound => {
                res.status(200).send(JSON.stringify({ success: isFound }));
            }).catch((error) => {
                res.send(JSON.stringify({ success: false, message: `${error}` }));
            });
            ;
        });
        app.post('/userAccount/signMessage/', (req, res) => {
            var userAccount = new UserAccount_1.UserAccount;
            try {
                var sig = userAccount.signMessage(req.body.privateKey, req.body.message);
                res.send(JSON.stringify({ success: true, signature: sig }));
            }
            catch (_a) {
                res.send(JSON.stringify({ success: false, signature: "" }));
            }
        });
        app.post('/userAccount/verifyMessage/', (req, res) => {
            var bitcoinMessage = require('bitcoinjs-message');
            var address = req.body.address;
            var signature = req.body.signature;
            var message = req.body.message;
            var success;
            try {
                success = bitcoinMessage.verify(message, address, signature);
                res.send(JSON.stringify({ success: true, confirmed: success }));
            }
            catch (_a) {
                res.send(JSON.stringify({ success: false, confirmed: false }));
            }
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