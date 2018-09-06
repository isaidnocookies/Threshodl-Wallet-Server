import * as mongoose from 'mongoose';
import { MicroWalletSchema } from '../models/microWalletModel';

class DarkWallet {

    coin : string = "";
    minBreak : string = "0.0001";
    minMagnitude : number = -4;

    estimateBreaks(totalToBreak : string) {
        var lTotal : number = parseFloat(totalToBreak);
        return (Math.floor(1.74448 * Math.log(18211.5 * lTotal)))
    }

    getBreakValues(totalToBreak : string) {
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
            var valueToBreak : string = valuesToBreak.pop();
            var splitValue : any = this.splitValues(valueToBreak);

            if (splitValue.valid) {
                finalValues.push(splitValue.int);

                var splitValueRem : any = this.getValueAndMagnitude(splitValue.remainder);

                if (valuesToBreak.length !== 0) {
                    var topValueToBreak : any = this.getValueAndMagnitude(valuesToBreak[valuesToBreak.length - 1]);
                    var pushToFinal : boolean = false;
    
                    //check if value is higher than top element on toBreak
                    if (splitValueRem.magnitude === topValueToBreak.magnitude) {
                        if (splitValueRem.value <= topValueToBreak.value) {
                            pushToFinal = true;
                        }
                    } else if (splitValueRem.magnitude < topValueToBreak.magnitude) {
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

    async saveMicroWallet(iOwner : string, uid : string, serverPk : string, userPk : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);

        var success : boolean = await this.checkUID(uid).then(isFound => {
            if (!isFound) {
                const newMicroWallet = new MicroWalletObject({recordType : "microwallet", owner : iOwner, uniqueId : uid, privateKey : serverPk, secretKey : userPk})
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
        return MicroWalletObject.find({uniqueId : uid}).then(docs => {
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
        return MicroWalletObject.find({uniqueId : uid}).then(docs => {
            if (docs.length) {
                return {success : true, uid : docs[0].uniqueId, owner : docs[0].owner, privateKey : docs[0].privateKey, secretKey : docs[0].secretKey, created : docs[0].created_date}
            } else {
                throw new Error ("UID not found");
            }
        });
    }

    async deleteMicroWallet(uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        var success : boolean = await MicroWalletObject.findOneAndDelete({uniqueId : uid}).then((query, err) => {
            if (query === null) {
                console.log("deleteMicroWallet findOneAndDelete returned ... " + query + "   Error: " + err)
                return false;
            }
            return true;
        });
        return success;
    }

    confirmOwnershipOfMicroWallet(owner : string, uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
        return MicroWalletObject.find({uniqueId : uid}).then(docs => {
            if (docs.length) {
                if (docs[0].owner === owner) {
                    return true;
                } else {
                    return false;
                }
            } else {
                throw new Error ("UID not found");
            }
        });
    }

    transferOwnershipOfMicroWallet(currentOwner : string, newOwner : string, uid : string) {
        var MicroWalletObject : any = mongoose.model('MicroWalletObject', MicroWalletSchema);
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