import * as mongoose from 'mongoose';
import { UserAccountSchema } from '../models/userAccountModel';
import { Config } from "../config/config";

class UserAccount {

    config : any = new Config();

    createMnemonicWords() {
        let Mnemonic : any = require('bitcore-mnemonic');
        var code : any = new Mnemonic(Mnemonic.Words.ENGLISH);
        var codeString : string = code.toString();

        return codeString;
    }

    signMessage(iPrivateKey : string, iMessage : string) {
        var bitcoin = require('bitcoinjs-lib'); // v3.3.2
        var bitcoinMessage = require('bitcoinjs-message');

        var keyPair : any = bitcoin.ECPair.fromWIF(iPrivateKey);
        var privateKey : any = keyPair.d.toBuffer(32);
        var message : string = iMessage;
        
        var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
        return signature.toString('base64');
    }

    verifyMessage(iAddress : string, iSignature : string, iMessage : string) {
        var bitcoinMessage = require('bitcoinjs-message');

        var address = iAddress;
        var signature = iSignature;
        var message = iMessage;
        
        console.log(bitcoinMessage.verify(message, address, signature))
    }

    createAccount(iUsername : string, iUid : string, iPublicKey : string) {
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);
        var username : string = iUsername.toLowerCase();

        return this.checkUsername(username).then(isFound => {
            if (isFound) {
                console.log("User already exists");
                return false;
            } else {
                const newUser = new UserAccountObject({recordtype: "user", username: username, uniqueid: iUid, publickey: iPublicKey, version: "1.0.0"});
                return newUser.save().then(() => {
                    console.log('New user was saved to db');
                    return true;
                }).catch(() => {
                    console.log("failed to save...");
                    return false;
                });
            }
        });
    }

    createAccountKeys(iSeed : string) {
        let Mnemonic : any = require('bitcore-mnemonic');
        var myBitcore : any = Mnemonic.bitcore;

        var recoveryString : string = iSeed;
        var lastIndex : number = recoveryString.lastIndexOf(" ");
        recoveryString = recoveryString.substring(0, lastIndex);
        recoveryString = recoveryString + " ThreshodlWallet";

        var theSeedValue = Buffer.from(recoveryString)
        var hash = myBitcore.crypto.Hash.sha256(theSeedValue);
        var bn = myBitcore.crypto.BN.fromBuffer(hash);

        var newPrivateKey : any = new myBitcore.PrivateKey(bn);
        var newWIF : any = newPrivateKey.toWIF();
        var newPublicKey : any = new myBitcore.PublicKey(newPrivateKey).toString();

        return [newWIF, newPublicKey];
    }

    checkUsername(iUsername : string) {
        var username : string = iUsername.toLowerCase();
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);
        return UserAccountObject.find({username : username}).then(docs => {
            if (docs.length){             
                console.log('user exists: ', username);
                return true;
            } else {
                return false;
            }
        });
    }

    checkPublicKeyExists(iPublicKey : string) {
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);
        return UserAccountObject.find({publickey : iPublicKey}).then(docs => {
            if (docs.length){             
                console.log('user exists: ', docs.username);
                return true;
            } else {
                return false;
            }
        });
    }

    validateUsername(iUsername : string) {
        if (iUsername.length < 32) {
            return true;
        }
        return false;
    }

    async changeUsername(iPublicKey : string, iNewUsername : string) {
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);
        var newUsername : string = iNewUsername.toLowerCase();
        return await UserAccountObject.find({publickey : iPublicKey}).then(docs => {
            if (docs.length !== 0) {
                docs[0].username = newUsername;
                return docs[0].save().then(() => {
                    return true;
                }).catch(() => {
                    console.log("caught by change username....");
                    return false;
                });
            } else {
                console.log("Transfer failed. Public Key not found..  Error..");
                return false;
            }
        });
    }

    getUsername(iPublicKey : string) {
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);
        return UserAccountObject.find({publickey : iPublicKey}).then(docs => {
            if (docs.length){
                return docs[0].username;
            } else {
                return "";
            }
        });
    }

    authenticateRequest(userId : string, message : string, password : string) {
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);
        return UserAccountObject.find({uniqueid : userId}).then(docs => {
            if (docs.length){
                console.log("Found user for auth");
                //temporary solution - check if public keys match...
                if (docs[0].publickey === message && password === this.config.authentication.password) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        });
    }
}

export { UserAccount };