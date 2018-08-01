"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserAccount {
    createMnemonicWords() {
        let Mnemonic = require('bitcore-mnemonic');
        var code = new Mnemonic(Mnemonic.Words.ENGLISH);
        var codeString = code.toString();
        return codeString;
    }
    createAccount() {
        throw new Error("Method not implemented.");
    }
    checkUsername() {
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