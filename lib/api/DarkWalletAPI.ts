import * as mongoose from 'mongoose';

class DarkWallet {

    coin : string = "";
    minBreak : string = "0.0001";

    estimateBreaks(totalToBreak : string) {
        var lTotal : number = parseFloat(totalToBreak);
        return (Math.floor(1.74448 * Math.log(18211.5 * lTotal)))
    }

    getBreakValues(totalToBreak : string) {

    }

    splitValues(value : string) {

    }
}

export { DarkWallet };



// int WalletGrinderAlpha::getMicroWalletValues(double iInitialAmount, std::vector<double> &oBreaks, int iPasses)
// {
//     std::vector<BValue> lBreaks;

//     getMicroWalletValues(iInitialAmount, lBreaks, iPasses);
//     for (auto lValue : lBreaks) {
//         oBreaks.emplace_back(getValueFromBValue(lValue));
//     }

//     return static_cast<int>(lBreaks.size());
// }

// int WalletGrinderAlpha::getMicroWalletValues(double iInitialAmount, std::vector<BValue> &oBreaks, int iPasses)
// {
//     std::vector<BValue> * lBreaks = getBreaks(iInitialAmount, iPasses);
//     oBreaks = *lBreaks;

//     return static_cast<int>(lBreaks->size());
// }

// bool WalletGrinderAlpha::checkCompleteness(std::vector<double> iBreaks, double iTotal)
// {
//     double lBreakTotal = 0;
//     std::vector<double> lFailedValues;

//     for (auto iBreak : iBreaks) {
//         lBreakTotal += iBreak;
//     }

//     if (std::abs(lBreakTotal - iTotal) > 0.00001) {
//         return false;
//     }

//     for (double value = LOWER_LIMIT; value <= iTotal; value += LOWER_LIMIT) {
//         double lCurrentValue = value;
//         for (size_t i = 0; i < iBreaks.size();  i++) {
//             if (iBreaks.at(i) <= lCurrentValue || std::abs(iBreaks.at(i) - lCurrentValue) < 0.0000001) {
//                 lCurrentValue = lCurrentValue - iBreaks.at(i);
//             }
//             if (lCurrentValue < 0.00001) {
//                 break;
//             }
//         }
//         if (lCurrentValue > 0.00001) {
//             std::cout << "Failed to make: " << value << std::endl;
//             return false;
//         }
//     }
//     return true;
// }

// int WalletGrinderAlpha::estimateBreakdown(double iValue)
// {
//     // accurate only for values with a single non-zero digit (i.e., 0.1, 0.001, 0.3, 1.0, 0.0006)
//     return static_cast<int>(1.74448 * std::log(18211.5 * iValue));
// }

// int WalletGrinderAlpha::getPlaceMultiplier(int indexOfDecimal, int currentIndex)
// {
//     int powMult = indexOfDecimal - currentIndex;

//     if (indexOfDecimal > currentIndex)
//         powMult -= 1;

//     return powMult;
// }

// double WalletGrinderAlpha::getValueFromBValue(BValue iValue)
// {
//     return iValue.value * (std::pow(10.0, iValue.multiplier));
// }

// BValue WalletGrinderAlpha::getBreakValue(BValue iValue)
// {
//     BValue lBreakValue;
//     float lMultiplier = iValue.multiplier;

//     if (iValue.value == 1) {
//         lBreakValue.multiplier = static_cast<int>(lMultiplier - 1);
//         lBreakValue.value = 5;
//     } else if (iValue.value == -1) {
//         return iValue;
//     } else {
//         lBreakValue.value = iValue.value / 2;
//         lBreakValue.multiplier = iValue.multiplier;
//     }

//     return lBreakValue;
// }

// BValue WalletGrinderAlpha::getBreakValueRemainder(BValue iValue)
// {
//     BValue lBreakValue = getBreakValue(iValue);
//     BValue lBreakValueRemainder;

//     if (iValue.value == 1) {
//         return lBreakValue;
//     }

//     lBreakValueRemainder.value = iValue.value - lBreakValue.value;
//     lBreakValueRemainder.multiplier = iValue.multiplier;

//     return lBreakValueRemainder;
// }

// std::vector<BValue> * WalletGrinderAlpha::getBreaks(double iStartValue, int iPasses)
// {
//     std::vector<BValue> *   lBreaks = new std::vector<BValue>();
//     std::vector<BValue> *   lInitialValues = new std::vector<BValue>();
//     QString                 lStartValueString;
//     int                     lDecimalIndex;
//     int                     lPasses = iPasses;

//     lStartValueString = QString::number(iStartValue, 'f');
//     lDecimalIndex = lStartValueString.indexOf(".");

//     for (int i = 0; i < lStartValueString.count(); i++) {
//         QString lSValue = lStartValueString.at(i);
//         BValue lNewValue;

//         if (lSValue != "." && lSValue != "0") {
//             lNewValue.value = lSValue.toInt();
//             lNewValue.multiplier = getPlaceMultiplier(lDecimalIndex, i);
//             lInitialValues->push_back(lNewValue);
//         }
//     }

//     while (!lInitialValues->empty()) {
//         BValue lCurrentValue = lInitialValues->front();
//         lInitialValues->erase(lInitialValues->begin());

//         if (lCurrentValue.multiplier == LOWER_LIMIT_POW && lCurrentValue.value == 1) {
//             lBreaks->push_back(lCurrentValue);
//             return lBreaks;
//         }

//         if (lInitialValues->size() > 0) {
//             while (lCurrentValue.multiplier >= lInitialValues->front().multiplier && lCurrentValue.value >= 1) {
//                 lBreaks->push_back(getBreakValue(lCurrentValue));
//                 lCurrentValue = getBreakValueRemainder(lCurrentValue);
//                 if (lCurrentValue.multiplier == lInitialValues->front().multiplier && lCurrentValue.value == 1) {
//                     lBreaks->push_back(lCurrentValue);
//                     break;
//                 }
//             }
//         } else {
//             while (lCurrentValue.multiplier >= LOWER_LIMIT_POW && lCurrentValue.value >= 1) {
//                 lBreaks->push_back(getBreakValue(lCurrentValue));
//                 lCurrentValue = getBreakValueRemainder(lCurrentValue);

//                 if (getValueFromBValue(lCurrentValue) <= LOWER_LIMIT) {
//                     lBreaks->push_back(lCurrentValue);
//                     break;
//                 }
//             }
//         }

//         std::sort(lBreaks->begin(), lBreaks->end(), &greaterThanBValue);

//         if (lInitialValues->empty()) {
//             lPasses --;
//             if (lPasses == 0) {
//                 break;
//             }
//             else {
//                 lInitialValues->push_back(lBreaks->front());
//                 lBreaks->erase(lBreaks->begin());
//             }
//         }
//     }

//     return lBreaks;
// }

// std::vector<BValue> * WalletGrinderAlpha::getBreaks(const QString iStartValue, int iPasses)
// {
//     std::vector<BValue> *   lBreaks = new std::vector<BValue>();
//     std::vector<BValue> *   lInitialValues = new std::vector<BValue>();
//     int                     lDecimalIndex;
//     int                     lPasses = iPasses;

//     QString                 lStartValue = iStartValue;

//     if( ! lStartValue.contains(QStringLiteral(".")) )
//         lStartValue.append(QStringLiteral(".0"));

//     lDecimalIndex = lStartValue.indexOf(".");

//     for (int i = 0; i < lStartValue.count(); i++) {
//         QString lSValue = lStartValue.at(i);
//         BValue lNewValue;

//         if (lSValue != "." && lSValue != "0") {
//             lNewValue.value = lSValue.toInt();
//             lNewValue.multiplier = getPlaceMultiplier(lDecimalIndex, i);
//             lInitialValues->push_back(lNewValue);
//         }
//     }

//     while (!lInitialValues->empty()) {
//         BValue lCurrentValue = lInitialValues->front();
//         lInitialValues->erase(lInitialValues->begin());

//         if (lCurrentValue.multiplier == LOWER_LIMIT_POW && lCurrentValue.value == 1) {
//             lBreaks->push_back(lCurrentValue);
//             return lBreaks;
//         }

//         if (lInitialValues->size() > 0) {
//             while (lCurrentValue.multiplier >= lInitialValues->front().multiplier && lCurrentValue.value >= 1) {
//                 lBreaks->push_back(getBreakValue(lCurrentValue));
//                 lCurrentValue = getBreakValueRemainder(lCurrentValue);
//                 if (lCurrentValue.multiplier == lInitialValues->front().multiplier && lCurrentValue.value == 1) {
//                     lBreaks->push_back(lCurrentValue);
//                     break;
//                 }
//             }
//         } else {
//             while (lCurrentValue.multiplier >= LOWER_LIMIT_POW && lCurrentValue.value >= 1) {
//                 lBreaks->push_back(getBreakValue(lCurrentValue));
//                 lCurrentValue = getBreakValueRemainder(lCurrentValue);

//                 if (getValueFromBValue(lCurrentValue) <= LOWER_LIMIT) {
//                     lBreaks->push_back(lCurrentValue);
//                     break;
//                 }
//             }
//         }

//         std::sort(lBreaks->begin(), lBreaks->end(), &greaterThanBValue);

//         if (lInitialValues->empty()) {
//             lPasses --;
//             if (lPasses == 0) {
//                 break;
//             }
//             else {
//                 lInitialValues->push_back(lBreaks->front());
//                 lBreaks->erase(lBreaks->begin());
//             }
//         }
//     }

//     return lBreaks;
// }

// bool WalletGrinderAlpha::greaterThanBValue(BValue iLHS, BValue iRHS)
// {
//     if (iLHS.multiplier == iRHS.multiplier) {
//         return iLHS.value > iRHS.value;
//     } else {
//         return iLHS.multiplier > iRHS.multiplier;
//     }
// }
