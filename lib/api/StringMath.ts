class StringMath {
    add(first : string, second : string) {
        var lValue1s : string;
        var lValue2s : string;
        var lIndex : number;
        var lNewValue : string = "";

        var standardizedStrings : any = this.standardizeStrings(first, second);
        lValue1s = standardizedStrings.first;
        lValue2s = standardizedStrings.second;
        lIndex = lValue1s.indexOf(".");

        lValue1s = lValue1s.substring(0, lIndex) + lValue1s.substring(lIndex + 1);
        lValue2s = lValue2s.substring(0, lIndex) + lValue2s.substring(lIndex + 1); 

        var lFromLast : number = 0;
        for (var i = lValue1s.length - 1; i >= 0; i--) {
            var lResult : number = parseInt(lValue1s.charAt(i)) + parseInt(lValue2s.charAt(i)) + lFromLast;
            
            var lCarry : number = Math.floor(lResult / 10);
            var lValue : number = lResult - (lCarry * 10);

            lNewValue = lValue.toString() + lNewValue;

            lFromLast = lCarry;
        }

        lNewValue = lNewValue.substring(0, lIndex) + "." + lNewValue.substring(lIndex);

        return lNewValue;
    }

    subtract(from : string, subtract : string) {
        if (parseFloat(from) - parseFloat(subtract) < 0) {
            return "0";
        }

        var lValue1s : string;
        var lValue2s : string;
        var lVStack1 : string[] = [];
        var lVStack2 : string[] = [];
        var lTempStack : string[] = [];
        var lOutput : string = "";

        var standardizedStrings : any = this.standardizeStrings(from, subtract);
        lValue1s = standardizedStrings.first;
        lValue2s = standardizedStrings.second;

        for (var i = 0; i < lValue1s.length; i++) {
            lVStack1.push(lValue1s.charAt(i));
            lVStack2.push(lValue2s.charAt(i));
        }

        while (!(lVStack1.length === 0) && !(lVStack2.length === 0)) {
            var lTemp1 : string = lVStack1.pop();
            var lTemp2 : string = lVStack2.pop();

            if (lTemp1 === ".") {
                lOutput = "." + lOutput;
            } else if (this.isGreaterThanOrEqualTo(lTemp1, lTemp2)) { 
                lOutput = (parseInt(lTemp1) - parseInt(lTemp2)).toString() + lOutput;
            } else if (this.isLessThan(lTemp1, lTemp2)) {
                while (!(lVStack1.length === 0) && (lVStack1[lVStack1.length - 1] == "." || lVStack1[lVStack1.length - 1] == "0")) {
                    lTempStack.push(lVStack1.pop());
                }

                lVStack1.push((parseInt(lVStack1.pop()) - 1).toString());

                while (!(lTempStack.length === 0)) {
                    if (lTempStack[lTempStack.length - 1] == ".") {
                        lVStack1.push(lTempStack.pop());
                    } else if (lTempStack[lTempStack.length - 1] == "0") {
                        lVStack1.push("9");
                        lTempStack.pop();
                    } else {
                        console.log("Shouldn't happen...");
                    }
                }

                lTemp1 = lTemp1 + "10";
                lOutput = (parseInt(lTemp1) - parseInt(lTemp2)).toString() + lOutput;
            }
        }
        return lOutput;
    }

    standardizeStrings(first : string, second : string) {
        var lValue1 : string = first;
        var lValue2 : string = second;
    
        if (lValue1.indexOf(".") < 0) { lValue1 += ".00"; }
        if (lValue2.indexOf(".") < 0) { lValue2 += ".00"; }
        while (lValue1.indexOf(".") < lValue2.indexOf(".")) { lValue1 = "0" + lValue1; }
        while (lValue1.indexOf(".") > lValue2.indexOf(".")) { lValue2 = "0" + lValue2; }
        while (lValue1.length < lValue2.length) { lValue1 += "0"; }
        while (lValue1.length > lValue2.length) { lValue2 += "0"; }

        lValue1 = "0" + lValue1 + "0";
        lValue2 = "0" + lValue2 + "0";

        return {first : lValue1, second : lValue2};
    }

    isGreaterThan(is : string, greaterThan : string) {
        var stStrings : any = this.standardizeStrings(is, greaterThan);
        var lValue1s : string = stStrings.first;
        var lValue2s : string = stStrings.second;
    
        for (var i = 0; i < lValue1s.length - 1; i++) {
            if (lValue1s.charAt(i) === lValue2s.charAt(i)) { continue; }
            if (parseInt(lValue1s.charAt(i)) < parseInt(lValue2s.charAt(i))) { return false; }
            if (parseInt(lValue1s.charAt(i)) > parseInt(lValue2s.charAt(i))) { return true; }
        }
        
        return false;
    }

    isGreaterThanOrEqualTo(is : string, greaterThanOrEqualTo : string) {
        var stStrings : any = this.standardizeStrings(is, greaterThanOrEqualTo);
        var lValue1s : string = stStrings.first;
        var lValue2s : string = stStrings.second;

        for (var i = 0; i < lValue1s.length - 1; i++) {
            if (lValue1s.charAt(i) == lValue2s.charAt(i)) { continue; }
            if (lValue1s.charAt(i) < lValue2s.charAt(i)) { return false; }
            if (lValue1s.charAt(i) > lValue2s.charAt(i)) { return true; }
        }

        return true;
    }

    isLessThan(is : string, lessThan : string) {
        var stStrings : any = this.standardizeStrings(is, lessThan);
        var lValue1s : string = stStrings.first;
        var lValue2s : string = stStrings.second;

        for (var i = 0; i < lValue1s.length - 1; i++) {
            if (lValue1s.charAt(i) == lValue2s.charAt(i)) { continue; }
            if (lValue1s.charAt(i) > lValue2s.charAt(i)) { return false; }
            if (lValue1s.charAt(i) < lValue2s.charAt(i)) { return true; }
        }

        return false;
    }

    isLessThanOrEqualTo(is : string, lessThanOrEqualTo : string) {
        var stStrings : any = this.standardizeStrings(is, lessThanOrEqualTo);
        var lValue1s : string = stStrings.first;
        var lValue2s : string = stStrings.second;

        for (var i = 0; i < lValue1s.length - 1; i++) {
            if (lValue1s.charAt(i) == lValue2s.charAt(i)) { continue; }
            if (lValue1s.charAt(i) > lValue2s.charAt(i)) { return false; }
            if (lValue1s.charAt(i) < lValue2s.charAt(i)) { return true; }
        }

        return true;
    }

    isEqual(first : string, second : string) {
        var stStrings : any = this.standardizeStrings(first, second);
        var lValue1s : string = stStrings.first;
        var lValue2s : string = stStrings.second;

        return lValue1s === lValue2s;
    }

    roundUpToNearest0001(value : string) {
        var floatValue : number = parseFloat(value);
        floatValue = floatValue * 10000;
        floatValue = Math.floor(floatValue);

        if (floatValue > 1) {
            var floatString : string = floatValue.toString();
            floatString = floatString.substring(0, floatString.length - 4) + "." + floatString.substring(floatString.length - 4);
            return (floatString);
        }
        return "0.0001";
    }
}

export { StringMath };