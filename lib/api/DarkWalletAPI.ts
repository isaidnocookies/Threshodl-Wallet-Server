import * as mongoose from 'mongoose';

import { StringMath } from '../api/StringMath';

import { MicroWalletSchema } from '../models/microWalletModel';
import { UserAccountSchema } from '../models/userAccountModel';

class DarkWallet {

    coin : string = "";
    minBreak : string = "0.0001";
    minMagnitude : number = -4;

    estimateBreaks(totalToBreak : string) {
        var lTotal : number = parseFloat(totalToBreak);
        return (Math.floor(1.74448 * Math.log(18211.5 * lTotal)))
    }

    getBreakValues(totalToBreak : string) {
        var stringMath : StringMath = new StringMath();
        var finalValues : string[] = [];
        var valuesToBreak : string[] = [];

        //break totalToBreak down into 'single non-zero digit' numbers
        for (var i = 0; i < totalToBreak.length; i++) {
            var temp : string = this.extractNonZeroDigit(totalToBreak, i);
            if (temp !== "-1") {
                valuesToBreak.push(temp);
            }
        }

        while (valuesToBreak.length > 0) {
            console.log(valuesToBreak);
            var valueToBreak : string = valuesToBreak.pop();
            var splitValue : any = this.splitValues(valueToBreak);

            if (splitValue.valid) {
                finalValues.push(splitValue.int);

                if (valuesToBreak.length !== 0) {
                    var pushToFinal : boolean = false;
                    
                    if (stringMath.isLessThanOrEqualTo(splitValue.remainder, valuesToBreak[valuesToBreak.length - 1])) {
                        pushToFinal = true;
                    } else if (stringMath.isEqual(splitValue.remainder, this.minBreak)) {
                        pushToFinal = true;
                    }
                } else {
                    pushToFinal = false;
                }

                if (pushToFinal) {
                    finalValues.push(splitValue.remainder);
                } else {
                    valuesToBreak.push(splitValue.remainder);
                }
            } else {
                finalValues.push(valueToBreak);
            }
        }

        return finalValues;
    }

    splitValues(value : string) {
        var valueAndMagnitude : any = this.getValueAndMagnitude(value);
        var digitValue : number = valueAndMagnitude.value;
        var valueMagnitude : number = valueAndMagnitude.magnitude;

        if (digitValue === 1) {
            digitValue = 10;
            valueMagnitude -= 1;

            if (valueMagnitude === 0) {
                valueMagnitude--;
            }
        }

        if (valueMagnitude < this.minMagnitude) {
            return {int : "", remainder : "", valid : false};
        }

        var intDivision : number = Math.floor(digitValue / 2); 
        var remainder : number = digitValue - intDivision;

        return {int: this.createValueFromMagnitudeAndValue(intDivision, valueMagnitude), remainder: this.createValueFromMagnitudeAndValue(remainder, valueMagnitude), valid: true}
    }

    createValueFromMagnitudeAndValue(value : number, magnitude : number) {
        var valueString : string = value.toString();

        if (magnitude < 0) {
            for (var i = 0; i < Math.abs(magnitude) - 1; i++) {
                valueString = "0" + valueString;
            }
            valueString = "0." + valueString;
        } else {
            for (var i = 0; i < magnitude - 1; i++) {
                valueString = valueString + "0";
            }
            valueString = valueString + ".00";
        }
        return valueString;
    }

    getValueAndMagnitude(value : string) {
        var nonValueIndex : number = -1;
        var indexOfDot : number = -1;
        var valueMagnitude : number;
        var digitValue : number;

        for (var i = 0; i < value.length; i++) {
            if (value.charAt(i) !== '0') {
                if (value.charAt(i) !== '.') {
                    nonValueIndex = i;
                    digitValue = parseInt(value.charAt(i));
                } else {
                    indexOfDot = i;
                }
            }

            if (nonValueIndex !== -1 && indexOfDot !== -1) {
                break;
            }
        }

        valueMagnitude = indexOfDot - nonValueIndex;
        return {value : digitValue, magnitude : valueMagnitude};
    }

    extractNonZeroDigit(value : string, nonZeroIndex : number) {
        var returnValue : string = value;
        var hasNonZeroValue : boolean = false;

        for (var i = 0; i < value.length; i++) {
            if (returnValue.charAt(i) !== '.') {
                if (returnValue.charAt(i) !== '0') {
                    if (i !== nonZeroIndex) {
                        returnValue = returnValue.substr(0, i) + "0" + returnValue.substr(i + 1);
                    } else {
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

    cleanUpValueString(value : string) {
        var returnValue : string = value;
        var index : number = 0;
        // remove leading zeros
        while(returnValue.charAt(index) === '0') {
            index++;
        }
        returnValue = returnValue.substr(index);

        //remove trailing zeros
        index = returnValue.length;
        while (returnValue.charAt(index-1) === '0') {
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

    async saveMicroWallet(iOwnerId : string, uid : string, serverPk : string, userPk : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);

        var success : boolean = await this.checkUID(uid).then(isFound => {
            if (!isFound) {
                const newMicroWallet = new MicroWalletObject({recordType : "microwallet", owner : iOwnerId, uniqueid : uid, privatekey : serverPk, secretkey : userPk, version: "1.0.0"});
                return newMicroWallet.save().then(() => {
                    console.log("MicroWallet saved to db");
                    return true;
                })
            } else {
                return false;
            }
        });

        return success;
    }

    checkUID(uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        return MicroWalletObject.find({uniqueid : uid}).then(docs => {
            if (docs.length) {
                console.log("UID Exists", docs[0].uniqueid);
                return true;
            } else {
                return false;
            }
        });
    }

    returnMicroWalletAndDelete(uid : string) {
        return this.getMicroWallet(uid).then(returnWallet => {
            return this.deleteMicroWallet(uid).then(success => {
                if (success) {
                    return returnWallet;
                } else {
                    throw new Error ("Failed to delete microwallet : returnMicroWalletAndDelete"); 
                }
            })
        });
    }

    getMicroWallet(uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        return MicroWalletObject.find({uniqueid : uid}).then(docs => {
            if (docs.length) {
                return {success : true, uid : docs[0].uniqueid, owner : docs[0].owner, privatekey : docs[0].privatekey, secretKey : docs[0].secretkey, created : docs[0].created_date}
            } else {
                throw new Error ("UID not found");
            }
        });
    }

    async deleteMicroWallet(uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        var success : boolean = await MicroWalletObject.findOneAndDelete({uniqueid : uid}).then((query, err) => {
            if (query === null) {
                console.log("deleteMicroWallet findOneAndDelete returned ... " + query + "   Error: " + err)
                return false;
            }
            return true;
        });
        return success;
    }

    async confirmOwnershipOfMicroWallet(ownerId : string, uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        return await MicroWalletObject.find({uniqueid : uid}).then(docs => {
            if (docs.length) {
                if (docs[0].owner === ownerId) {
                    return true;
                } else {
                    return false;
                }
            } else {
                throw new Error ("UID not found");
            }
        });
    }

    async transferOwnershipOfMicroWallet(currentOwnerId : string, iNewOwnerUsername : string, uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        var UserAccountObject : any = mongoose.model('UserAccountObject', UserAccountSchema);
        var newOwnerUsername : string = iNewOwnerUsername.toLowerCase();

        return await UserAccountObject.find({username: newOwnerUsername}).then((uquery, err) => {
            if (uquery === null) {
                return false;
            } else {
                var newOwnerId : string = uquery[0].uniqueid;
                return MicroWalletObject.find({uniqueid : uid}).then((mquery, err) => {
                    if (mquery === null) {
                        console.log("Transfer failed. UID not found..  Error: " + err)
                        return false;
                    } else {
                        if (mquery[0].owner === currentOwnerId) {
                            mquery[0].previousowner = currentOwnerId;
                            mquery[0].owner = newOwnerId;
                            return mquery[0].save();
                        } else {
                            console.log("Invalid owner... Do not have access to this wallet");
                            return false;
                        }
                    }
                });
            }
        }).catch((err) => {
            console.log("Caught error in transfer... " + err);
            return false;
        });
    }

    async confirmMicroWalletTransfer(uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        return await MicroWalletObject.find({uniqueid : uid}).then((query, err) => {
            if (query === null) {
                console.log("Transfer failed. UID not found..  Error: " + err)
                return false;
            } else {
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
    }
    
    async revertMicroWalletTransfer(uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        return await MicroWalletObject.find({uniqueid : uid}).then((query, err) => {
            if (query === null) {
                console.log("revert failed. UID not found..  Error: " + err)
                return false;
            } else {
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
    }

    confirmTransfer(uid : string[]) {
        var success : boolean = true;
        for (var i = 0; i < uid.length; i++) {
            if (!this.confirmMicroWalletTransfer(uid[i])) {
                success = false;
            }
        }
        return success;
    }

    revertTransfer(uid : string[]) {
        var success : boolean = true;
        for (var i = 0; i < uid.length; i++) {
            if (!this.revertMicroWalletTransfer(uid[i])) {
                success = false;
            }
        }
        return success;
    }

    splitPrivateKey(pkToSplit : string) {
        var userPk : string = "";
        var serverPk : string = "";

        for (var i = 0; i < pkToSplit.length; i++) {
            if (i % 2 === 0) {
                userPk = userPk + pkToSplit.charAt(i);
            } else {
                serverPk = serverPk + pkToSplit.charAt(i);
            }
        }

        return {user: userPk, server: serverPk};
    }

    combinePrivateKey(userKey : string, serverKey : string) {
        var fullKey : string = "";

        for (var i = 0; i < userKey.length; i++) {
            fullKey += userKey.charAt(i);
            if (i < serverKey.length) {
                fullKey += serverKey.charAt(i);
            }
        }

        return fullKey;
    }
}

export { DarkWallet };