import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as https from "https";
import * as fs from "fs";
import * as helmet from 'helmet';

import { Routes } from "./routes/routes";
import { UserAccountRoutes } from "./routes/userAccountRoutes";
import { WalletRoutes } from "./routes/walletRoutes";
import { Config } from "./config/config";
import { DarkRoutes } from "./routes/darkRoutes";

class App {
    // Public variables for application
    public app : express.Application;
    public router : any;
    public configuration : any = new Config();
    public server : https.Server;

    // Routes for api
    public baseRoutes : Routes = new Routes();
    public userAccountRoutes : UserAccountRoutes = new UserAccountRoutes();
    public walletRoutes : WalletRoutes = new WalletRoutes();
    public darkRoutes : DarkRoutes = new DarkRoutes();

    // MongoDB route
    public mongoUrl : string = (this.configuration.localEnvironment ? this.configuration.db.test.url : this.configuration.db.production.url);

    // Constructor for express app. Configures server and starts the listening process
    constructor() {
        this.app = express();

        this.config();
        this.mongoSetup();
        this.createServer();
        this.setupRoutes();
        this.listen();
    }

    // Create HTTPS Server for Requests
    private createServer() : void {
        var privateKey = fs.readFileSync('./certs/site.keyfile', 'utf8');
        var certificate = fs.readFileSync('./certs/site.crtfile', 'utf8');
        var credentials: any = { key: privateKey, cert: certificate };

        this.server = https.createServer(credentials, this.app);
    }

    // Setup routes for each "Module"
    private setupRoutes() : void {
        this.baseRoutes.routes(this.app);
        this.userAccountRoutes.routes(this.app);
        this.walletRoutes.routes(this.app);
        this.darkRoutes.routes(this.app);
    }
    
    // Configure express app with middleware
    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(helmet());
    }

    // Setup MongoDB connection
    private mongoSetup(): void{
        mongoose.Promise = global.Promise;
        mongoose.connect(this.mongoUrl, { useNewUrlParser: true });    
    }

    // Listen using server created in createServer()
    private listen(): void {
        var port : number = this.configuration.port;

        if (this.configuration.localEnvironment) {
            this.app.listen(port, function () {
                console.log(`HTTP server running at ${port}`);
            });
        } else {
            this.server.listen(port, function () {
                console.log(`HTTPS server running at ${port}`);
            });
        }

    }
}

export default new App().app;