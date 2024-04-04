'use strict';

export function getGcd(num1, num2) {
    if (num1 === 0 || num2 === 0 || num1 === 1 || num2 === 1) {
        return 1;
    }
    if (!num1 || !num2) {
        throw (`getGcd: Wrong parameters (${num1}, ${num2}).`);
    }

    let big = num1 > num2 ? num1 : num2;
    let small = num1 < num2 ? num1 : num2;

    let counter = 0;
    while (small !== 0 && big !== NaN && small !== NaN) {
        if (counter++ > 1000) {
            throw (`getGcd: More than 1000 trials (${big}, ${small}).`);
        }
        let temp = big % small;
        big = small;
        small = temp;
    }

    return Math.abs(big);
}

//TODO performance check
export function getPrimeFactors(n) {
    let factors = [];
    let divisor = 2;
    while (n >= 2) {
        if (n % divisor == 0) {
            factors.push(divisor);
            n = n / divisor;
        } else {
            divisor++;
        }
    }
    return factors;
}