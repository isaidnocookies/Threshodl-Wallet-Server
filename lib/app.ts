import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";

import { Routes } from "./routes/routes";
import { UserAccountRoutes } from "./routes/userAccountRoutes";
import { WalletRoutes } from "./routes/walletRoutes";
// import { DarkRoutes } from "./routes/darkRoutes";

class App {
    public app: express.Application;

    public baseRoutes: Routes = new Routes();
    public userAccountRoutes: UserAccountRoutes = new UserAccountRoutes();
    public walletRoutes: WalletRoutes = new WalletRoutes();
    public mongoUrl: string = 'mongodb://localhost/Threshodl';

    constructor() {
        this.app = express();
        this.config();
        this.mongoSetup();
        
        this.baseRoutes.routes(this.app);
        this.userAccountRoutes.routes(this.app);
        this.walletRoutes.routes(this.app);
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

//npm run build
//rpm start dev