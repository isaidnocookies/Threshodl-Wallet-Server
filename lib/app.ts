import * as express from "express";
import * as bodyParser from "body-parser";

import { Routes } from "./routes/routes";
import { UserAccountRoutes } from "./routes/userAccountRoutes";
import { WalletRoutes } from "./routes/walletRoutes";
import { DarkRoutes } from "./routes/darkRoutes";

class App {
    public app: express.Application;

    public baseRoutes: Routes = new Routes();
    public userAccountRoutes: UserAccountRoutes = new UserAccountRoutes();
    public walletRoutes: WalletRoutes = new WalletRoutes();

    constructor() {
        this.app = express();
        this.config();
        
        this.baseRoutes.routes(this.app);
        this.userAccountRoutes.routes(this.app);
        this.walletRoutes.routes(this.app);
    }
    
    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
}

export default new App().app;

//npm run build
//rpm start dev