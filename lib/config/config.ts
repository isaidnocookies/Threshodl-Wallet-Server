export class Config
{
    nodes : any = {
        exchange: {
            host: '',
            token: 'this-will-be-the-coin-server-token'
        },
        bch:{
            host: "http://cash:388a74f00eb5a0064b57c5c048ccbb85@18.144.60.209:18332",
        },
        btc:{
            host: "http://threshodl:h0lyThr35h0dLb@7m@n13@54.193.16.100:8332",
        },
        dash:{
            host: "http://dash:388a74f00eb5a0064b57c5c048ccbb85@18.144.13.232:9998",
        },
        ltc:{
            host: "http://lite:388a74f00eb5a0064b57c5c048ccbb85@18.144.41.155:9332",
        },
        zec:{
            host: "http://zcash:388a74f00eb5a0064b57c5c048ccbb85@54.193.95.108:8232",
        },
        doge:{
            host: "http://doge:388a74f00eb5a0064b57c5c048ccbb85@54.183.61.83:22556",
        },
        eth:{
            host:"http://10.10.0.163:8545",
            url: "http://10.10.0.163:8545",
            networkId: 3,
            networkName: "ropsten",
            networkType: "testnet",
            token: {
                ownerAddress: "0x83634a8eaadc34b860b4553e0daf1fac1cb43b1e",
                tokenContractAddress: "0x3e672122bfd3d6548ee1cc4f1fa111174e8465fb",
                migrateContractAddress: "0xa8ebf36b0a34acf98395bc5163103efc37621052"
            }
        }
    }

    insightServers = {
        bch:{
            host: "",
        },
        btc:{
            host: "https://insight.bitpay.com/api",
        },
        dash:{
            host: "",
        },
        ltc:{
            host: "",
        },
        zec:{
            host: "",
        },
        doge:{
            host: "",
        }
    }

    externalapis = {
        taskserver: {
            host: "https://ts.threebx.com/a/exchangerate",
        }
    }

    confirmations = {
        btc: 2, //Confirmations needed for change from pending to success transaction.
        bch: 2,
        dash: 10,
        ltc: 2,
        zec: 2,
        eth: 10,
        doge: 2
    }
}