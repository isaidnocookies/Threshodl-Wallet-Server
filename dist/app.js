"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const routes_1 = require("./routes/routes");
const userAccountRoutes_1 = require("./routes/userAccountRoutes");
const walletRoutes_1 = require("./routes/walletRoutes");
class App {
    constructor() {
        this.baseRoutes = new routes_1.Routes();
        this.userAccountRoutes = new userAccountRoutes_1.UserAccountRoutes();
        this.walletRoutes = new walletRoutes_1.WalletRoutes();
        this.app = express();
        this.config();
        this.baseRoutes.routes(this.app);
        this.userAccountRoutes.routes(this.app);
        this.walletRoutes.routes(this.app);
    }
    config() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map