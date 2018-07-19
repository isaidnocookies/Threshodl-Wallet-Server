import { Request, Response } from 'express';

import * as express from 'express';

export class Routes {
    public routes (app) : void {
        app.route('/').get((req: Request, res: Response) => {
            res.status(200).send({message: "Threshodl get!"})
        })

        app.post('/', (req: Request, res: Response) => {
            const data = req.body.data;
            res.status(200).send("Hello, world " + data);
        });
    }
}