import { Request, Response } from 'express'
import * as express from 'express';

export class DarkRoutes {
    public routes (app) : any {
        app.route('/dark/').get((req: Request, res: Response) => {
            res.status(200).send({message: "Dark hello world!"})
        })

        app.post('/dark/send/', (req: Request, res: Response) => {
            res.send(JSON.stringify({success: false}));
        });

        app.post('/dark/checkOwnership/', (req: Request, res: Response) => {
            res.send(JSON.stringify({success: false}));
        });

        app.post('/dark/claimWallets/', (req: Request, res: Response) => {
            res.send(JSON.stringify({success: false}));
        });
    }
}