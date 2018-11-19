"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const routes_1 = require("./routes/routes");
const userAccountRoutes_1 = require("./routes/userAccountRoutes");
const walletRoutes_1 = require("./routes/walletRoutes");
const config_1 = require("./config/config");
const darkRoutes_1 = require("./routes/darkRoutes");
class App {
    // Constructor for express app. Configures server and starts the listening process
    constructor() {
        this.configuration = new config_1.Config();
        // Routes for api
        this.baseRoutes = new routes_1.Routes();
        this.userAccountRoutes = new userAccountRoutes_1.UserAccountRoutes();
        this.walletRoutes = new walletRoutes_1.WalletRoutes();
        this.darkRoutes = new darkRoutes_1.DarkRoutes();
        // MongoDB route
        this.mongoUrl = (this.configuration.localEnvironment ? this.configuration.db.test.url : this.configuration.db.production.url);
        this.app = express();
        this.config();
        this.mongoSetup();
        this.createServer();
        this.setupRoutes();
        this.listen();
    }
    // Create HTTPS Server for Requests
    createServer() {
        var privateKey = fs.readFileSync('./certs/site.keyfile', 'utf8');
        var certificate = fs.readFileSync('./certs/site.crtfile', 'utf8');
        var credentials = { key: privateKey, cert: certificate };
        this.server = https.createServer(credentials, this.app);
    }
    // Setup routes for each "Module"
    setupRoutes() {
        this.baseRoutes.routes(this.app);
        this.userAccountRoutes.routes(this.app);
        this.walletRoutes.routes(this.app);
        this.darkRoutes.routes(this.app);
    }
    // Configure express app with middleware
    config() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(helmet());
    }
    // Setup MongoDB connection
    mongoSetup() {
        mongoose.Promise = global.Promise;
        mongoose.connect(this.mongoUrl, { useNewUrlParser: true });
    }
    // Listen using server created in createServer()
    listen() {
        var port = this.configuration.port;
        if (this.configuration.localEnvironment) {
            this.app.listen(port, function () {
                console.log(`HTTP server running at ${port}`);
            });
        }
        else {
            this.server.listen(port, function () {
                console.log(`HTTPS server running at ${port}`);
            });
        }
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map