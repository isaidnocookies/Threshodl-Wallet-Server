"use strict";
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
    validateUsername(iUsername) {
        throw new Error("Method not implemented.");
    }
    changeUsername(publicKey, newUsername) {
        throw new Error("Method not implemented.");
    }
    getUsername(publicKey) {
        throw new Error("Method not implemented.");
    }
}
exports.UserAccount = UserAccount;
//# sourceMappingURL=UserAccount.js.map