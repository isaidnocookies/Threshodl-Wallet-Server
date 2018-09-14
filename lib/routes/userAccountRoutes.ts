import { Request, Response } from 'express'
import { UserAccount } from '../api/UserAccount';

export class UserAccountRoutes {
    public routes (app) : any {
        app.route('/userAccount/').get((req: Request, res: Response) => {
            var userAccount : any = new UserAccount;
            res.status(200).send({message: "User account says, hello world!"})
        })

        app.post('/userAccount/', (req: Request, res: Response) => {
            var userAccount : any = new UserAccount;
            userAccount.authenticateRequest(req.body.username, req.body.message, req.body.password).then(passed => {
                res.status(200).send({success: passed, message: "Testing auth function..."})
            });
        })

        app.post('/userAccount/create/', (req: Request, res: Response) => {
            var userAccount : any = new UserAccount;
            var lUsername : string = req.body.username;

            var lSeed : string = userAccount.createMnemonicWords();
            var keys : any = userAccount.createAccountKeys(lSeed);
            var lPrivateKey : string = lPrivateKey = keys[0];
            var lPublicKey : string = lPublicKey = keys[1];

            console.log("About to save user to db");

            userAccount.createAccount(lUsername, lPublicKey, lPublicKey).then(success => {
                if (!success) {
                    lUsername = "";
                    lSeed = "";
                    lPrivateKey = "";
                    lPublicKey = "";
                }
                res.send(JSON.stringify({success: success, username: lUsername, seed: lSeed, publickey: lPublicKey, privatekey: lPrivateKey}));
            }).catch((error) => {
                res.send(JSON.stringify({success: false, message: `${error}`}));
            });
        });

        app.post('/userAccount/recover/', (req: Request, res: Response) => {
            var userAccount : any = new UserAccount;

            var lSeed : string = req.body.seed;
            var keys : any = userAccount.createAccountKeys(lSeed);
            var lPrivateKey : string = lPrivateKey = keys[0];
            var lPublicKey : string = lPublicKey = keys[1];
            var success : boolean;

            console.log("Recovering Account...");

            // //Testing and avoiding the account recovery for username...
            // res.send(JSON.stringify({success: true, username: "username", seed: lSeed, publicKey: lPublicKey, privateKey: lPrivateKey}));
            // return;

            userAccount.getUsername(lPublicKey).then(username => {
                if (username.length <= 0) {
                    success = false; lSeed = ""; keys = ""; lPrivateKey = ""; lPublicKey = "";
                } else {
                    success = true;
                }
                res.send(JSON.stringify({success: success, username: username, seed: lSeed, publicKey: lPublicKey, privateKey: lPrivateKey}));
            }).catch((error) => {
                res.send(JSON.stringify({success: false, message: `${error}`}));
            });
        });

        app.post('/userAccount/accountExists/', (req: Request, res: Response) => {
            var userAccount : any = new UserAccount;
            var lUsername : string = req.body.username;

            userAccount.checkUsername(lUsername).then(isFound => {
                res.status(200).send(JSON.stringify({success: isFound}));
            }).catch((error) => {
                res.send(JSON.stringify({success: false, message: `${error}`}));
            });;
        });

        app.post('/userAccount/signMessage/', (req: Request, res: Response) => {
            var userAccount : any = new UserAccount;
            try {
                var sig : any = userAccount.signMessage(req.body.privateKey, req.body.message);
                res.send(JSON.stringify({success: true, signature: sig}));
            } catch {
                res.send(JSON.stringify({success: false, signature: ""}));
            }
        });

        app.post('/userAccount/verifyMessage/', (req: Request, res: Response) => {
            var bitcoinMessage = require('bitcoinjs-message');
            
            var address : string = req.body.address;
            var signature : string = req.body.signature;
            var message : string = req.body.message;
            var success : boolean;

            try {
                success = bitcoinMessage.verify(message, address, signature);
                res.send(JSON.stringify({success: true, confirmed: success}));
            } catch {
                res.send(JSON.stringify({success: false, confirmed: false}));
            }
        });

        app.post('/userAccount/mnemonicSeed/', (req: Request, res: Response) => {
            let userAccountApi : UserAccount = new UserAccount;
            var seed : any = userAccountApi.createMnemonicWords();
            userAccountApi = null;
            res.send(JSON.stringify({success: true, seed: seed}));
        });
    }
}