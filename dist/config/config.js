"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    constructor() {
        this.localEnvironment = true;
        this.port = 3333;
        this.authentication = {
            password: "threshodlpassword"
        };
        this.db = {
            production: {
                url: "mongodb://thdl:9msb6kvSlJz3elwLdJ9f@18.224.238.46/threshodl?retryWrites=true" // change to url or hostname __ use dns resolution
            },
            test: {
                url: "mongodb://localhost/Threshodl"
            }
        };
        this.nodes = {
            bch: {
                main: "",
                testnet: "http://cash:388a74f00eb5a0064b57c5c048ccbb85@18.144.60.209:18332",
            },
            btc: {
                main: "",
                testnet: "http://threshodl:h0lyThr35h0dLb@7m@n13@52.53.247.25:8332"
            },
            dash: {
                main: "",
                testnet: "http://dash:388a74f00eb5a0064b57c5c048ccbb85@18.144.13.232:9998",
            },
            ltc: {
                main: "",
                testnet: "http://lite:388a74f00eb5a0064b57c5c048ccbb85@18.144.41.155:9332",
            },
            zec: {
                main: "",
                testnet: "http://zcash:388a74f00eb5a0064b57c5c048ccbb85@54.193.95.108:8232",
            },
            doge: {
                main: "",
                testnet: "http://doge:388a74f00eb5a0064b57c5c048ccbb85@54.183.61.83:22556",
            }
            // eth:{
            //     host:"http://10.10.0.163:8545",
            //     url: "http://10.10.0.163:8545",
            //     networkId: 3,
            //     networkName: "ropsten",
            //     networkType: "testnet",
            //     token: {
            //         ownerAddress: "0x83634a8eaadc34b860b4553e0daf1fac1cb43b1e",
            //         tokenContractAddress: "0x3e672122bfd3d6548ee1cc4f1fa111174e8465fb",
            //         migrateContractAddress: "0xa8ebf36b0a34acf98395bc5163103efc37621052"
            //     }
            // }
        };
        this.blockExplorers = {
            bch: {
                main: "https://bch-insight.bitpay.com/api",
                testnet: "https://test-bch-insight.bitpay.com/api",
            },
            btc: {
                main: "https://insight.bitpay.com/api",
                testnet: "https://test-insight.bitpay.com/api"
                //testnet: "https://test-insight.bitpay.com/api",
            },
            dash: {
                main: "https://insight.dash.org/insight-api",
                testnet: "https://test.insight.dash.siampm.com/api",
            },
            ltc: {
                main: "https://insight.litecore.io/api",
                testnet: "https://testnet.litecore.io/api",
            },
            zec: {
                main: "https://zcashnetwork.info/api",
                testnet: "https://explorer.testnet.z.cash/api",
            },
            doge: {
                main: "https://dogechain.info/api/v1",
                testnet: "https://chain.so/api/v2",
            }
        };
        this.externalapis = {
            taskserver: {
                host: "https://ts.threebx.com/a/exchangerate",
            }
        };
        this.confirmations = {
            btc: 2,
            bch: 2,
            dash: 5,
            ltc: 2,
            zec: 2,
            eth: 5,
            doge: 2
        };
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map