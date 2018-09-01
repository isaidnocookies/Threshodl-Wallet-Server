import { Request, Response } from 'express'
import { DarkWallet } from '../api/DarkWalletAPI';

export class DarkRoutes {
    public routes (app) : any {
        app.route('/dark/').get((req: Request, res: Response) => {
            res.status(200).send({message: "Dark hello world!"})
        })

        app.post('/dark/', (req: Request, res: Response) => {
            var darkWallet : DarkWallet = new DarkWallet();
            res.status(200).send({value: darkWallet.getBreakValues(req.body.value)})
        });

        app.post('/dark/getBreaks/', (req: Request, res: Response) => {
            var inputAmount : string = req.body.amount;
            var breaks : string[];
            var lSuccess : boolean = true;

            var darkWallet : DarkWallet = new DarkWallet();

            breaks = darkWallet.getBreakValues(inputAmount);

            res.send(JSON.stringify({success: lSuccess, values: breaks}));
        });

        app.post('/dark/estimateBreaks/', (req: Request, res: Response) => {
            var inputAmount : string = req.body.amount;
            var darkWallet : DarkWallet = new DarkWallet();
            var breakEstimate : number = darkWallet.estimateBreaks(inputAmount);
            var lSuccess : boolean = true;

            if (breakEstimate <= 0) {
                lSuccess = false;
            }

            res.send(JSON.stringify({success: lSuccess, estimate: breakEstimate}));
        });

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