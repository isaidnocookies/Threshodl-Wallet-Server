"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAccount_1 = require("../api/UserAccount");
class UserAccountRoutes {
    routes(app) {
        app.route('/userAccount/').get((req, res) => {
            res.status(200).send({ message: "User account api ping" });
        });
        app.post('/userAccount/signMessage', (req, res) => {
            // let userAccountApi : UserAccount = new UserAccount;
            // var message : string = req.body.message;
            // var privateKey : string = req.body.privateKey;
            // var signature : any = userAccountApi.signMessage(privateKey, message);
            // userAccountApi = null;
            res.send(JSON.stringify({ success: false, signature: "" }));
        });
        app.post('/userAccount/mnemonicSeed', (req, res) => {
            let userAccountApi = new UserAccount_1.UserAccount;
            var seed = userAccountApi.createMnemonicWords();
            userAccountApi = null;
            res.send(JSON.stringify({ success: true, seed: seed }));
        });
    }
}
exports.UserAccountRoutes = UserAccountRoutes;
//# sourceMappingURL=userAccountRoutes.js.map