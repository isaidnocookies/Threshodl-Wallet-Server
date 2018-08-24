import * as mongoose from 'mongoose';
import { UserAccountSchema } from '../models/userAccountModel';
class UserAccount {

    createMnemonicWords() {
        let Mnemonic : any = require('bitcore-mnemonic');
        var code : any = new Mnemonic(Mnemonic.Words.ENGLISH);
        var codeString : string = code.toString();

        return codeString;
    }

    createAccount(iUsername : string, iUid : string, iPublicKey : string) {
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);

        return this.checkUsername(iUsername).then(isFound => {
            if (isFound) {
                return false;
            } else {
                const newUser = new UserAccountObject({recordType: "user", username: iUsername, uniqueid: iUid, publickey: iPublicKey});
                return newUser.save().then(() => {
                    console.log('New user was saved to db')
                    return true;
                }).catch(() => {
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
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);
        return UserAccountObject.find({username : iUsername}).then(docs => {
            if (docs.length){             
                console.log('user exists: ', iUsername);
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
        throw new Error("Method not implemented.");
    }

    changeUsername(publicKey : string, newUsername : string) {
        throw new Error("Method not implemented.");
    }

    getUsername(publicKey : string) {
        throw new Error("Method not implemented.");
    }
}

export { UserAccount };