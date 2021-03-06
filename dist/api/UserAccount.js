"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const userAccountModel_1 = require("../models/userAccountModel");
const config_1 = require("../config/config");
class UserAccount {
    constructor() {
        this.config = new config_1.Config();
    }
    createMnemonicWords() {
        let Mnemonic = require('bitcore-mnemonic');
        var code = new Mnemonic(Mnemonic.Words.ENGLISH);
        var codeString = code.toString();
        return codeString;
    }
    signMessage(iPrivateKey, iMessage) {
        var bitcoin = require('bitcoinjs-lib'); // v3.3.2
        var bitcoinMessage = require('bitcoinjs-message');
        var keyPair = bitcoin.ECPair.fromWIF(iPrivateKey);
        var privateKey = keyPair.d.toBuffer(32);
        var message = iMessage;
        var signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed);
        return signature.toString('base64');
    }
    verifyMessage(iAddress, iSignature, iMessage) {
        var bitcoinMessage = require('bitcoinjs-message');
        var address = iAddress;
        var signature = iSignature;
        var message = iMessage;
        console.log(bitcoinMessage.verify(message, address, signature));
    }
    createAccount(iUsername, iUid, iPublicKey) {
        var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
        var username = iUsername.toLowerCase();
        return this.checkUsername(username).then(isFound => {
            if (isFound) {
                console.log("User already exists");
                return false;
            }
            else {
                const newUser = new UserAccountObject({ recordtype: "user", username: username, uniqueid: iUid, publickey: iPublicKey, version: "1.0.0" });
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
    createAccountKeys(iSeed) {
        let Mnemonic = require('bitcore-mnemonic');
        var myBitcore = Mnemonic.bitcore;
        var recoveryString = iSeed;
        var lastIndex = recoveryString.lastIndexOf(" ");
        recoveryString = recoveryString.substring(0, lastIndex);
        recoveryString = recoveryString + " ThreshodlWallet";
        var theSeedValue = Buffer.from(recoveryString);
        var hash = myBitcore.crypto.Hash.sha256(theSeedValue);
        var bn = myBitcore.crypto.BN.fromBuffer(hash);
        var newPrivateKey = new myBitcore.PrivateKey(bn);
        var newWIF = newPrivateKey.toWIF();
        var newPublicKey = new myBitcore.PublicKey(newPrivateKey).toString();
        return [newWIF, newPublicKey];
    }
    checkUsername(iUsername) {
        var username = iUsername.toLowerCase();
        var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
        return UserAccountObject.find({ username: username }).then(docs => {
            if (docs.length) {
                console.log('user exists: ', username);
                return true;
            }
            else {
                return false;
            }
        });
    }
    checkPublicKeyExists(iPublicKey) {
        var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
        return UserAccountObject.find({ publickey: iPublicKey }).then(docs => {
            if (docs.length) {
                console.log('user exists: ', docs.username);
                return true;
            }
            else {
                return false;
            }
        });
    }
    validateUsername(iUsername) {
        if (iUsername.length < 32) {
            return true;
        }
        return false;
    }
    changeUsername(iPublicKey, iNewUsername) {
        return __awaiter(this, void 0, void 0, function* () {
            var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
            var newUsername = iNewUsername.toLowerCase();
            return yield UserAccountObject.find({ publickey: iPublicKey }).then(docs => {
                if (docs.length !== 0) {
                    docs[0].username = newUsername;
                    return docs[0].save().then(() => {
                        return true;
                    }).catch(() => {
                        console.log("caught by change username....");
                        return false;
                    });
                }
                else {
                    console.log("Transfer failed. Public Key not found..  Error..");
                    return false;
                }
            });
        });
    }
    getUsername(iPublicKey) {
        var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
        return UserAccountObject.find({ publickey: iPublicKey }).then(docs => {
            if (docs.length) {
                return docs[0].username;
            }
            else {
                return "";
            }
        });
    }
    authenticateRequest(userId, message, password) {
        var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
        return UserAccountObject.find({ uniqueid: userId }).then(docs => {
            if (docs.length) {
                console.log("Found user for auth");
                //temporary solution - check if public keys match...
                if (docs[0].publickey === message && password === this.config.authentication.password) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        });
    }
}
exports.UserAccount = UserAccount;
//# sourceMappingURL=UserAccount.js.map