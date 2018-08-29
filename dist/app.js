"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const routes_1 = require("./routes/routes");
const userAccountRoutes_1 = require("./routes/userAccountRoutes");
const walletRoutes_1 = require("./routes/walletRoutes");
const config_1 = require("./config/config");
// import { DarkRoutes } from "./routes/darkRoutes";
class App {
    constructor() {
        this.configuration = new config_1.Config();
        this.baseRoutes = new routes_1.Routes();
        this.userAccountRoutes = new userAccountRoutes_1.UserAccountRoutes();
        this.walletRoutes = new walletRoutes_1.WalletRoutes();
        this.mongoUrl = (this.configuration.localEnvironment ? this.configuration.db.test.url : this.configuration.db.production.url);
        this.app = express();
        this.config();
        this.mongoSetup();
        this.baseRoutes.routes(this.app);
        this.userAccountRoutes.routes(this.app);
        this.walletRoutes.routes(this.app);
    }
    config() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
    mongoSetup() {
        mongoose.Promise = global.Promise;
        mongoose.connect(this.mongoUrl, { useNewUrlParser: true });
    }
}
exports.default = new App().app;
//npm run build
//rpm start dev
//# sourceMappingURL=app.js.map