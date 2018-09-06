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
const microWalletModel_1 = require("../models/microWalletModel");
class DarkWallet {
    constructor() {
        this.coin = "";
        this.minBreak = "0.0001";
        this.minMagnitude = -4;
    }
    estimateBreaks(totalToBreak) {
        var lTotal = parseFloat(totalToBreak);
        return (Math.floor(1.74448 * Math.log(18211.5 * lTotal)));
    }
    getBreakValues(totalToBreak) {
        var finalValues = [];
        var valuesToBreak = [];
        //break totalToBreak down into 'single non-zero digit' numbers
        for (var i = 0; i < totalToBreak.length; i++) {
            var temp = this.extractNonZeroDigit(totalToBreak, i);
            if (temp !== "-1") {
                valuesToBreak.push(temp);
            }
        }
        while (valuesToBreak.length > 0) {
            var valueToBreak = valuesToBreak.pop();
            var splitValue = this.splitValues(valueToBreak);
            if (splitValue.valid) {
                finalValues.push(splitValue.int);
                var splitValueRem = this.getValueAndMagnitude(splitValue.remainder);
                if (valuesToBreak.length !== 0) {
                    var topValueToBreak = this.getValueAndMagnitude(valuesToBreak[valuesToBreak.length - 1]);
                    var pushToFinal = false;
                    //check if value is higher than top element on toBreak
                    if (splitValueRem.magnitude === topValueToBreak.magnitude) {
                        if (splitValueRem.value <= topValueToBreak.value) {
                            pushToFinal = true;
                        }
                    }
                    else if (splitValueRem.magnitude < topValueToBreak.magnitude) {
                        pushToFinal = true;
                    }
                }
                else {
                    pushToFinal = false;
                }
                if (pushToFinal) {
                    finalValues.push(splitValue.remainder);
                }
                else {
                    valuesToBreak.push(splitValue.remainder);
                }
            }
            else {
                finalValues.push(valueToBreak);
            }
        }
        return finalValues;
    }
    splitValues(value) {
        var valueAndMagnitude = this.getValueAndMagnitude(value);
        var digitValue = valueAndMagnitude.value;
        var valueMagnitude = valueAndMagnitude.magnitude;
        if (digitValue === 1) {
            digitValue = 10;
            valueMagnitude -= 1;
        }
        if (valueMagnitude < this.minMagnitude) {
            return { int: "", remainder: "", valid: false };
        }
        var intDivision = Math.floor(digitValue / 2);
        var remainder = digitValue - intDivision;
        return { int: this.createValueFromMagnitudeAndValue(intDivision, valueMagnitude), remainder: this.createValueFromMagnitudeAndValue(remainder, valueMagnitude), valid: true };
    }
    createValueFromMagnitudeAndValue(value, magnitude) {
        var valueString = value.toString();
        if (magnitude < 0) {
            for (var i = 0; i < Math.abs(magnitude) - 1; i++) {
                valueString = "0" + valueString;
            }
            valueString = "0." + valueString;
        }
        else {
            for (var i = 0; i < magnitude - 1; i++) {
                valueString = valueString + "0";
            }
            valueString = valueString + ".00";
        }
        return valueString;
    }
    getValueAndMagnitude(value) {
        var nonValueIndex = -1;
        var indexOfDot = -1;
        var valueMagnitude;
        var digitValue;
        for (var i = 0; i < value.length; i++) {
            if (value.charAt(i) !== '0') {
                if (value.charAt(i) !== '.') {
                    nonValueIndex = i;
                    digitValue = parseInt(value.charAt(i));
                }
                else {
                    indexOfDot = i;
                }
            }
            if (nonValueIndex !== -1 && indexOfDot !== -1) {
                break;
            }
        }
        valueMagnitude = indexOfDot - nonValueIndex;
        return { value: digitValue, magnitude: valueMagnitude };
    }
    extractNonZeroDigit(value, nonZeroIndex) {
        var returnValue = value;
        var hasNonZeroValue = false;
        for (var i = 0; i < value.length; i++) {
            if (returnValue.charAt(i) !== '.') {
                if (returnValue.charAt(i) !== '0') {
                    if (i !== nonZeroIndex) {
                        returnValue = returnValue.substr(0, i) + "0" + returnValue.substr(i + 1);
                    }
                    else {
                        hasNonZeroValue = true;
                    }
                }
            }
        }
        if (hasNonZeroValue) {
            return this.cleanUpValueString(returnValue);
        }
        return "-1";
    }
    cleanUpValueString(value) {
        var returnValue = value;
        var index = 0;
        // remove leading zeros
        while (returnValue.charAt(index) === '0') {
            index++;
        }
        returnValue = returnValue.substr(index);
        //remove trailing zeros
        index = returnValue.length;
        while (returnValue.charAt(index - 1) === '0') {
            index--;
        }
        returnValue = returnValue.substring(0, index);
        if (returnValue.charAt(0) === '.') {
            returnValue = "0" + returnValue;
        }
        if (!returnValue.includes('.')) {
            returnValue = returnValue + ".00";
        }
        if (returnValue.charAt(returnValue.length - 1) === '.') {
            returnValue = returnValue + "00";
        }
        return returnValue;
    }
    saveMicroWallet(iOwner, uid, serverPk, userPk) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            var success = yield this.checkUID(uid).then(isFound => {
                if (!isFound) {
                    const newMicroWallet = new MicroWalletObject({ recordType: "microwallet", owner: iOwner, uniqueId: uid, privateKey: serverPk, secretKey: userPk });
                    return newMicroWallet.save().then(() => {
                        console.log("MicroWallet saved to db");
                        return true;
                    });
                }
                else {
                    return false;
                }
            });
            return success;
        });
    }
    checkUID(uid) {
        var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
        return MicroWalletObject.find({ uniqueId: uid }).then(docs => {
            if (docs.length) {
                console.log("UID Exists", docs[0].uniqueid);
                return true;
            }
            else {
                return false;
            }
        });
    }
    returnMicroWalletAndDelete(uid) {
        return this.getMicroWallet(uid).then(returnWallet => {
            return this.deleteMicroWallet(uid).then(success => {
                if (success) {
                    return returnWallet;
                }
                else {
                    throw new Error("Failed to delete microwallet : returnMicroWalletAndDelete");
                }
            });
        });
    }
    getMicroWallet(uid) {
        var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
        return MicroWalletObject.find({ uniqueId: uid }).then(docs => {
            if (docs.length) {
                return { success: false, uid: docs[0].uniqueId, owner: docs[0].owner, privateKey: docs[0].privateKey, secretKey: docs[0].secretKey, created: docs[0].created_date };
            }
            else {
                throw new Error("UID not found");
            }
        });
    }
    deleteMicroWallet(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            var success = yield MicroWalletObject.findOneAndDelete({ uniqueId: uid }).then((query, err) => {
                if (query === null) {
                    console.log("deleteMicroWallet findOneAndDelete returned ... " + query + "   Error: " + err);
                    return false;
                }
                return true;
            });
            return success;
        });
    }
    confirmOwnershipOfMicroWallet(owner, uid) {
        var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
    }
    transferOwnershipOfMicroWallet(currentOwner, newOwner, uid) {
        var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
    }
    splitPrivateKey(pkToSplit) {
        var userPk = "";
        var serverPk = "";
        for (var i = 0; i < pkToSplit.length; i++) {
            if (i % 2 === 0) {
                userPk = userPk + pkToSplit.charAt(i);
            }
            else {
                serverPk = serverPk + pkToSplit.charAt(i);
            }
        }
        return { user: userPk, server: serverPk };
    }
    combinePrivateKey(userKey, serverKey) {
        var fullKey = "";
        for (var i = 0; i < userKey.length; i++) {
            fullKey += userKey.charAt(i);
            if (i < serverKey.length) {
                fullKey += serverKey.charAt(i);
            }
        }
        return fullKey;
    }
}
exports.DarkWallet = DarkWallet;
//# sourceMappingURL=DarkWalletAPI.js.map