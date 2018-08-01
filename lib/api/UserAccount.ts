class UserAccount {
    createMnemonicWords() {
        let Mnemonic : any = require('bitcore-mnemonic');
        var code : any = new Mnemonic(Mnemonic.Words.ENGLISH);
        var codeString : string = code.toString();

        return codeString;
    }

    createAccount() {
        throw new Error("Method not implemented.");
    }

    checkUsername() {
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