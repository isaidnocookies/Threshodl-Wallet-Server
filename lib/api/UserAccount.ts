class UserAccount {
    createMnemonicWords() {
        let Mnemonic : any = require('bitcore-mnemonic');
        var code : any = new Mnemonic(Mnemonic.Words.ENGLISH);
        var codeString : string = code.toString();

        return codeString;
    }
}

export { UserAccount };