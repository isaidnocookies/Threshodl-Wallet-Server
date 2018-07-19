"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Routes {
    routes(app) {
        app.route('/').get((req, res) => {
            res.status(200).send({ message: "Threshodl get!" });
        });
        app.post('/', (req, res) => {
            const data = req.body.data;
            res.status(200).send("Hello, world " + data);
        });
    }
}
exports.Routes = Routes;
//# sourceMappingURL=routes.js.map