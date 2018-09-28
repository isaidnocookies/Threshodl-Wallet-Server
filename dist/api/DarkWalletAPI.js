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
const StringMath_1 = require("../api/StringMath");
const microWalletModel_1 = require("../models/microWalletModel");
const userAccountModel_1 = require("../models/userAccountModel");
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
        var stringMath = new StringMath_1.StringMath();
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
                if (valuesToBreak.length !== 0) {
                    var pushToFinal = false;
                    if (stringMath.isLessThanOrEqualTo(splitValue.remainder, valuesToBreak[valuesToBreak.length - 1])) {
                        pushToFinal = true;
                    }
                    else if (stringMath.isEqual(splitValue.remainder, this.minBreak)) {
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
            if (valueMagnitude === 0) {
                valueMagnitude--;
            }
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
    saveMicroWallet(iOwnerId, uid, serverPk, userPk) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            console.log("Saving wallet for " + iOwnerId);
            var success = yield this.checkUID(uid).then(isFound => {
                if (!isFound) {
                    try {
                        const newMicroWallet = new MicroWalletObject({ recordtype: "microwallet", owner: iOwnerId, uniqueid: uid, privatekey: serverPk, secretkey: userPk, version: "1.0.0" });
                        return newMicroWallet.save().then(() => {
                            console.log("MicroWallet saved to db");
                            return true;
                        });
                    }
                    catch (_a) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }).catch(err => {
                console.log("failed on find() of UID... " + err);
                return false;
            });
            return success;
        });
    }
    getMicroWalletUID(address, coin) {
        var date = new Date();
        var timestamp = date.getTime().toString();
        var uid = coin + address + timestamp;
        var random = Math.random().toString();
        random = random.substr(random.indexOf(".") + 1);
        uid = random + this.simpleHash(uid).toString() + timestamp;
        var newUID = timestamp + coin.toLowerCase();
        for (var i = 0; i < 64; i++) {
            if (i < uid.length) {
                newUID = newUID + uid.charAt(i);
            }
            if (i < address.length) {
                newUID = newUID + address.charAt(i);
            }
            if (i >= uid.length && i >= address.length) {
                break;
            }
        }
        newUID = newUID.replace("-", "0");
        return newUID;
    }
    simpleHash(value) {
        var hash = 0;
        if (value.length == 0) {
            return hash;
        }
        for (var i = 0; i < value.length; i++) {
            var char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    checkUID(uid) {
        var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
        return MicroWalletObject.find({ uniqueid: uid }).then(docs => {
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
    completeMicroWallet(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            return yield MicroWalletObject.find({ uniqueid: uid }).then(docs => {
                if (docs.length) {
                    docs[0].hasbeencompleted = true;
                    return docs[0].save();
                }
                else {
                    throw new Error("UID not found");
                }
            });
        });
    }
    revertCompleteMicroWallet(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            return yield MicroWalletObject.find({ uniqueid: uid }).then(docs => {
                if (docs.length) {
                    docs[0].hasbeencompleted = false;
                    return docs[0].save();
                }
                else {
                    throw new Error("UID not found");
                }
            });
        });
    }
    getMicroWallet(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            return yield MicroWalletObject.find({ uniqueid: uid }).then(docs => {
                if (docs.length >= 1) {
                    return { success: true, uid: docs[0].uniqueid, owner: docs[0].owner, privatekey: docs[0].privatekey, secretKey: docs[0].secretkey, created: docs[0].created_date };
                }
                else {
                    throw new Error("UID not found");
                }
            }).catch(() => {
                return { success: false };
            });
        });
    }
    deleteMicroWallet(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            var success = yield MicroWalletObject.findOneAndDelete({ uniqueid: uid }).then((query, err) => {
                if (query === null) {
                    console.log("deleteMicroWallet findOneAndDelete returned ... " + query + "   Error: " + err);
                    return false;
                }
                return true;
            });
            return success;
        });
    }
    confirmOwnershipOfMicroWallet(ownerId, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            return yield MicroWalletObject.find({ uniqueid: uid }).then(docs => {
                if (docs.length) {
                    if (docs[0].owner === ownerId) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    throw new Error("UID not found");
                }
            }).catch((error) => {
                console.log("327: " + error);
                return false;
            });
        });
    }
    transferOwnershipOfMicroWallet(currentOwnerId, iNewOwnerUsername, uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            var UserAccountObject = mongoose.model('UserAccountObject', userAccountModel_1.UserAccountSchema);
            var newOwnerUsername = iNewOwnerUsername.toLowerCase();
            return yield UserAccountObject.find({ username: newOwnerUsername }).then((uquery) => {
                if (uquery === null) {
                    return false;
                }
                else {
                    try {
                        var newOwnerId = uquery[0].uniqueid;
                        return MicroWalletObject.find({ uniqueid: uid }).then((mquery, err) => {
                            if (mquery === null) {
                                console.log("Transfer failed. UID not found..  Error: " + err);
                                return false;
                            }
                            else {
                                if (mquery[0].owner === currentOwnerId) {
                                    mquery[0].previousowner = currentOwnerId;
                                    mquery[0].owner = newOwnerId;
                                    return mquery[0].save();
                                }
                                else {
                                    console.log("Invalid owner... Do not have access to this wallet");
                                    return false;
                                }
                            }
                        });
                    }
                    catch (_a) {
                        console.log("Caught error with user query..");
                        return false;
                    }
                }
            }).catch((err) => {
                console.log("Caught error in transfer... " + err);
                return false;
            });
        });
    }
    confirmMicroWalletTransfer(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            return yield MicroWalletObject.find({ uniqueid: uid }).then((query, err) => {
                if (query === null) {
                    console.log("Transfer failed. UID not found..  Error: " + err);
                    return false;
                }
                else {
                    query[0].previousowner = "";
                    return query[0].save().then(() => {
                        return true;
                    }).catch(() => {
                        console.log("Caught by confirmation of transfer....");
                        return false;
                    });
                }
            }).catch(() => {
                console.log("Fucking shit on confirm transfer...");
                return false;
            });
        });
    }
    revertMicroWalletTransfer(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            var MicroWalletObject = mongoose.model('MicroWalletObject', microWalletModel_1.MicroWalletSchema);
            return yield MicroWalletObject.find({ uniqueid: uid }).then((query, err) => {
                if (query === null) {
                    console.log("revert failed. UID not found..  Error: " + err);
                    return false;
                }
                else {
                    query[0].owner = query[0].previousowner;
                    query[0].previousowner = "";
                    return query[0].save().then(() => {
                        return true;
                    }).catch(() => {
                        console.log("caught by confirmation of transfer....");
                        return false;
                    });
                }
            });
        });
    }
    confirmTransfer(uid) {
        var success = true;
        for (var i = 0; i < uid.length; i++) {
            if (!this.confirmMicroWalletTransfer(uid[i])) {
                success = false;
            }
        }
        return success;
    }
    revertTransfer(uid) {
        var success = true;
        for (var i = 0; i < uid.length; i++) {
            if (!this.revertMicroWalletTransfer(uid[i])) {
                success = false;
            }
        }
        return success;
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