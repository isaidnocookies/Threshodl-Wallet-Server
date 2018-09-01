import { Request, Response } from 'express'
import { UserAccount } from '../api/UserAccount';

export class UserAccountRoutes {
    public routes (app) : any {
        app.route('/userAccount/').get((req: Request, res: Response) => {
            var userAccount : any = new UserAccount;
            res.status(200).send({message: "User account says, hello world!"})
        })

        app.post('/userAccount/create/', (req: Request, res: Response) => {
            var userAccount : any = new UserAccount;
            var lUsername : string = req.body.username;

            var lSeed : string = userAccount.createMnemonicWords();
            var keys : any = userAccount.createAccountKeys(lSeed);
            var lPrivateKey : string = lPrivateKey = keys[0];
            var lPublicKey : string = lPublicKey = keys[1];

            userAccount.createAccount(lUsername, lPublicKey, lPublicKey).then(success => {
                if (!success) {
                    lUsername = "";
                    lSeed = "";
                    lPrivateKey = "";
                    lPublicKey = "";
                }
                res.send(JSON.stringify({success: success, username: lUsername, seed: lSeed, publicKey: lPublicKey, privateKey: lPrivateKey}));
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
            // TODO...
            res.send(JSON.stringify({success: false, signature: ""}));
        });

        app.post('/userAccount/mnemonicSeed/', (req: Request, res: Response) => {
            let userAccountApi : UserAccount = new UserAccount;
            var seed : any = userAccountApi.createMnemonicWords();
            userAccountApi = null;
            res.send(JSON.stringify({success: true, seed: seed}));
        });
    }
}