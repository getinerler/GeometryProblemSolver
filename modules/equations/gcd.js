'use strict';

export function getGcd(val1, val2) {
    if (val1 === 0 || val2 === 0 || val1 === 1 || val2 === 1) {
        return 1;
    }
    if (!val1 || !val2) {
        throw (`getGcd: Wrong parameters (${val1}, ${val2}).`);
    }
    let big = val1 > val2 ? val1 : val2;
    let small = val1 < val2 ? val1 : val2;
    let counter = 0;
    while (small !== 0 && small !== 1 && big !== NaN && small !== NaN) {
        if (counter > 1000) {
            throw (`getGcd: More than 1000 trials (${big}, ${small}).`);
        }
        let temp = big % small;
        big = small;
        small = temp;
        counter++;
    }
    return Math.abs(big);
}