import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as https from "https";
import * as fs from "fs";

import { Routes } from "./routes/routes";
import { UserAccountRoutes } from "./routes/userAccountRoutes";
import { WalletRoutes } from "./routes/walletRoutes";
import { Config } from "./config/config";
import { DarkRoutes } from "./routes/darkRoutes";

class App {
    public app: express.Application;
    public configuration : any = new Config();
    public server : https.Server;

    public baseRoutes: Routes = new Routes();
    public userAccountRoutes: UserAccountRoutes = new UserAccountRoutes();
    public walletRoutes: WalletRoutes = new WalletRoutes();
    public darkRoutes: DarkRoutes = new DarkRoutes();

    public mongoUrl : string = (this.configuration.localEnvironment ? this.configuration.db.test.url : this.configuration.db.production.url);

    constructor() {
        this.app = express();
        this.config();
        this.mongoSetup();
        
        this.baseRoutes.routes(this.app);
        this.userAccountRoutes.routes(this.app);
        this.walletRoutes.routes(this.app);
        this.darkRoutes.routes(this.app);
    }
    
    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    private mongoSetup(): void{
        mongoose.Promise = global.Promise;
        mongoose.connect(this.mongoUrl, { useNewUrlParser: true });    
    }
}

export default new App().app;