"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserAccount {
    createMnemonicWords() {
        // Workaround for multiple instances of bitcore-lib
        delete global["_bitcore"];
        let Mnemonic = require('bitcore-mnemonic');
        var code = new Mnemonic(Mnemonic.Words.ENGLISH);
        var codeString = code.toString();
        Mnemonic = null;
        return codeString;
    }
    signMessage(wif, message) {
        return "";
    }
    ;
}
exports.UserAccount = UserAccount;
//# sourceMappingURL=UserAccount.js.map