import { Request, Response } from 'express'
import * as express from 'express';
import { UserAccount } from '../api/UserAccount';

export class UserAccountRoutes {
    public routes (app) : any {
        app.route('/userAccount/').get((req: Request, res: Response) => {
            res.status(200).send({message: "User account says, hello world!"})
        })

        app.post('/userAccount/create/', (req: Request, res: Response) => {
            var userAccount : any = new UserAccount;

            // Validate Username
                // TODO:

            // Create Seed
            var seed : string = userAccount.createMnemonicWords();

            // Create Private Key and Public Key

            // Return useraccount information
            res.send(JSON.stringify({success: false, username: "", seed: seed}));
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