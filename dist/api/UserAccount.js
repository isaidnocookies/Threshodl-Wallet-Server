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
class UserAccount {
    createMnemonicWords() {
        let Mnemonic = require('bitcore-mnemonic');
        var code = new Mnemonic(Mnemonic.Words.ENGLISH);
        var codeString = code.toString();
        return codeString;
    }
    createAccount(iUsername, iUid, iPublicKey) {
        var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
        return this.checkUsername(iUsername).then(isFound => {
            if (isFound) {
                return false;
            }
            else {
                const newUser = new UserAccountObject({ recordType: "user", username: iUsername, uniqueid: iUid, publickey: iPublicKey });
                return newUser.save().then(() => {
                    console.log('New user was saved to db');
                    return true;
                }).catch(() => {
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
        var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
        return UserAccountObject.find({ username: iUsername }).then(docs => {
            if (docs.length) {
                console.log('user exists: ', iUsername);
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
    changeUsername(iPublicKey, newUsername) {
        return __awaiter(this, void 0, void 0, function* () {
            var UserAccountObject = mongoose.model('MicroWalletObject', userAccountModel_1.UserAccountSchema);
            return yield UserAccountObject.find({ publickey: iPublicKey }).then((query, err) => {
                if (query === null) {
                    console.log("Transfer failed. Public Key not found..  Error: " + err);
                    return false;
                }
                else {
                    query[0].username = newUsername;
                    return query[0].save().then(() => {
                        return true;
                    }).catch(() => {
                        console.log("caught by change username....");
                        return false;
                    });
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
}
exports.UserAccount = UserAccount;
//# sourceMappingURL=UserAccount.js.map