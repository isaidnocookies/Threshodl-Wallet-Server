"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const port = 3333;
app_1.default.listen(port, function () {
    console.log('Threshodl wallet server listening on port ' + port);
});
//# sourceMappingURL=server.js.map