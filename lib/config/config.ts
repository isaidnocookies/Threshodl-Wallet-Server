export class Config
{
    localEnvironment : boolean = true;

    port : number = 3333;

    authentication : any = {
        password: "threshodlpassword"
    };

    db : any = {
        production : {
            url: "mongodb://thdl:9msb6kvSlJz3elwLdJ9f@18.224.238.46/threshodl?retryWrites=true" // change to url or hostname __ use dns resolution
        },
        test : {
            url: "mongodb://localhost/Threshodl"
        }
    };

    nodes : any = {
        bch:{
            main: "",
            testnet: "http://cash:388a74f00eb5a0064b57c5c048ccbb85@18.144.60.209:18332",
        },
        btc:{
            main: "",
            testnet: "http://threshodl:h0lyThr35h0dLb@7m@n13@52.53.247.25:8332"
        },
        dash:{
            main: "",
            testnet: "http://dash:388a74f00eb5a0064b57c5c048ccbb85@18.144.13.232:9998",
        },
        ltc:{
            main: "",
            testnet: "http://lite:388a74f00eb5a0064b57c5c048ccbb85@18.144.41.155:9332",
        },
        zec:{
            main: "",
            testnet: "http://zcash:388a74f00eb5a0064b57c5c048ccbb85@54.193.95.108:8232",
        },
        doge:{
            main: "",
            testnet: "http://doge:388a74f00eb5a0064b57c5c048ccbb85@54.183.61.83:22556",
        }
    };

    blockExplorers = {
        bch:{
            main: "https://bch-insight.bitpay.com/api",
            testnet: "https://test-bch-insight.bitpay.com/api",
        },
        btc:{
            main: "https://insight.bitpay.com/api",
            testnet: "https://test-insight.bitpay.com/api"
        },
        dash:{
            main: "https://insight.dash.org/insight-api",
            testnet: "https://chain.so/api/v2"
        },
        ltc:{
            main: "https://insight.litecore.io/api",
            testnet: "https://chain.so/api/v2",
            testnetInsight: "https://testnet.litecore.io/api"
        },
        zec:{
            main: "https://zcashnetwork.info/api",
            testnet: "https://chain.so/api/v2"
        },
        doge:{
            main: "https://chain.so/api/v2",
            testnet: "https://chain.so/api/v2",
        }
    };

    defaultFees = {
        btc: "0.0005",
        bch: "0.00005",
        dash: "0.00001",
        ltc: "0.0005",
        zec: "0.0001",
        eth: "0.001",
        doge: "2"
    }

    externalapis = {
        taskserver: {
            host: "https://ts.threebx.com/a/exchangerate",
        }
    };

    confirmations = {
        btc: 2, //Confirmations needed for change from pending to success transaction.
        bch: 2,
        dash: 5,
        ltc: 2,
        zec: 2,
        eth: 5,
        doge: 2
    };
}