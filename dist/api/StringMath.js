"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class StringMath {
    add(first, second) {
        var lValue1s;
        var lValue2s;
        var lIndex;
        var lNewValue = "";
        var standardizedStrings = this.standardizeStrings(first, second);
        lValue1s = standardizedStrings.first;
        lValue2s = standardizedStrings.second;
        lIndex = lValue1s.indexOf(".");
        lValue1s = lValue1s.substring(0, lIndex) + lValue1s.substring(lIndex + 1);
        lValue2s = lValue2s.substring(0, lIndex) + lValue2s.substring(lIndex + 1);
        var lFromLast = 0;
        for (var i = lValue1s.length - 1; i >= 0; i--) {
            var lResult = parseInt(lValue1s.charAt(i)) + parseInt(lValue2s.charAt(i)) + lFromLast;
            var lCarry = Math.floor(lResult / 10);
            var lValue = lResult - (lCarry * 10);
            lNewValue = lValue.toString() + lNewValue;
            lFromLast = lCarry;
        }
        lNewValue = lNewValue.substring(0, lIndex) + "." + lNewValue.substring(lIndex);
        return lNewValue;
    }
    subtract(from, subtract) {
        if (parseFloat(from) - parseFloat(subtract) < 0) {
            return "0";
        }
        var lValue1s;
        var lValue2s;
        var lVStack1 = [];
        var lVStack2 = [];
        var lTempStack = [];
        var lOutput = "";
        var standardizedStrings = this.standardizeStrings(from, subtract);
        lValue1s = standardizedStrings.first;
        lValue2s = standardizedStrings.second;
        for (var i = 0; i < lValue1s.length; i++) {
            lVStack1.push(lValue1s.charAt(i));
            lVStack2.push(lValue2s.charAt(i));
        }
        while (!(lVStack1.length === 0) && !(lVStack2.length === 0)) {
            var lTemp1 = lVStack1.pop();
            var lTemp2 = lVStack2.pop();
            if (lTemp1 === ".") {
                lOutput = "." + lOutput;
            }
            else if (this.isGreaterThanOrEqualTo(lTemp1, lTemp2)) {
                lOutput = (parseInt(lTemp1) - parseInt(lTemp2)).toString() + lOutput;
            }
            else if (this.isLessThan(lTemp1, lTemp2)) {
                while (!(lVStack1.length === 0) && (lVStack1[lVStack1.length - 1] == "." || lVStack1[lVStack1.length - 1] == "0")) {
                    lTempStack.push(lVStack1.pop());
                }
                lVStack1.push((parseInt(lVStack1.pop()) - 1).toString());
                while (!(lTempStack.length === 0)) {
                    if (lTempStack[lTempStack.length - 1] == ".") {
                        lVStack1.push(lTempStack.pop());
                    }
                    else if (lTempStack[lTempStack.length - 1] == "0") {
                        lVStack1.push("9");
                        lTempStack.pop();
                    }
                    else {
                        console.log("Shouldn't happen...");
                    }
                }
                lTemp1 = lTemp1 + "10";
                lOutput = (parseInt(lTemp1) - parseInt(lTemp2)).toString() + lOutput;
            }
        }
        return lOutput;
    }
    standardizeStrings(first, second) {
        var lValue1 = first;
        var lValue2 = second;
        if (lValue1.indexOf(".") < 0) {
            lValue1 += ".00";
        }
        if (lValue2.indexOf(".") < 0) {
            lValue2 += ".00";
        }
        while (lValue1.indexOf(".") < lValue2.indexOf(".")) {
            lValue1 = "0" + lValue1;
        }
        while (lValue1.indexOf(".") > lValue2.indexOf(".")) {
            lValue2 = "0" + lValue2;
        }
        while (lValue1.length < lValue2.length) {
            lValue1 += "0";
        }
        while (lValue1.length > lValue2.length) {
            lValue2 += "0";
        }
        lValue1 = "0" + lValue1 + "0";
        lValue2 = "0" + lValue2 + "0";
        return { first: lValue1, second: lValue2 };
    }
    isGreaterThan(is, greaterThan) {
        var stStrings = this.standardizeStrings(is, greaterThan);
        var lValue1s = stStrings.first;
        var lValue2s = stStrings.second;
        for (var i = 0; i < lValue1s.length - 1; i++) {
            if (lValue1s.charAt(i) === lValue2s.charAt(i)) {
                continue;
            }
            if (parseInt(lValue1s.charAt(i)) < parseInt(lValue2s.charAt(i))) {
                return false;
            }
            if (parseInt(lValue1s.charAt(i)) > parseInt(lValue2s.charAt(i))) {
                return true;
            }
        }
        return false;
    }
    isGreaterThanOrEqualTo(is, greaterThanOrEqualTo) {
        var stStrings = this.standardizeStrings(is, greaterThanOrEqualTo);
        var lValue1s = stStrings.first;
        var lValue2s = stStrings.second;
        for (var i = 0; i < lValue1s.length - 1; i++) {
            if (lValue1s.charAt(i) == lValue2s.charAt(i)) {
                continue;
            }
            if (lValue1s.charAt(i) < lValue2s.charAt(i)) {
                return false;
            }
            if (lValue1s.charAt(i) > lValue2s.charAt(i)) {
                return true;
            }
        }
        return true;
    }
    isLessThan(is, lessThan) {
        var stStrings = this.standardizeStrings(is, lessThan);
        var lValue1s = stStrings.first;
        var lValue2s = stStrings.second;
        for (var i = 0; i < lValue1s.length - 1; i++) {
            if (lValue1s.charAt(i) == lValue2s.charAt(i)) {
                continue;
            }
            if (lValue1s.charAt(i) > lValue2s.charAt(i)) {
                return false;
            }
            if (lValue1s.charAt(i) < lValue2s.charAt(i)) {
                return true;
            }
        }
        return false;
    }
    isLessThanOrEqualTo(is, lessThanOrEqualTo) {
        var stStrings = this.standardizeStrings(is, lessThanOrEqualTo);
        var lValue1s = stStrings.first;
        var lValue2s = stStrings.second;
        for (var i = 0; i < lValue1s.length - 1; i++) {
            if (lValue1s.charAt(i) == lValue2s.charAt(i)) {
                continue;
            }
            if (lValue1s.charAt(i) > lValue2s.charAt(i)) {
                return false;
            }
            if (lValue1s.charAt(i) < lValue2s.charAt(i)) {
                return true;
            }
        }
        return true;
    }
    isEqual(first, second) {
        var stStrings = this.standardizeStrings(first, second);
        var lValue1s = stStrings.first;
        var lValue2s = stStrings.second;
        return lValue1s === lValue2s;
    }
    roundUpToNearest0001(value) {
        var floatValue = parseFloat(value);
        floatValue = floatValue * 10000;
        floatValue = Math.floor(floatValue);
        if (floatValue > 1) {
            var floatString = floatValue.toString();
            floatString = floatString.substring(0, floatString.length - 4) + "." + floatString.substring(floatString.length - 4);
            return (floatString);
        }
        return "0.0001";
    }
}
exports.StringMath = StringMath;
//# sourceMappingURL=StringMath.js.map