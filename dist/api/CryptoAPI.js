"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Network;
(function (Network) {
    Network[Network["Mainnet"] = 1] = "Mainnet";
    Network[Network["Testnet"] = 2] = "Testnet";
    Network[Network["Regtest"] = 3] = "Regtest";
    Network[Network["Invalid"] = 4] = "Invalid";
})(Network || (Network = {}));
exports.Network = Network;
class CryptoAPI {
    constructor() { }
}
exports.CryptoAPI = CryptoAPI;
//# sourceMappingURL=CryptoAPI.js.map