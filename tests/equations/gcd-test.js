'use strict';

import { getGcd } from '../../modules/equations/gcd.js';
import { it, assert } from '../test.js';

document.addEventListener('DOMContentLoaded', function () {

    console.log('Check gcd...');

    it('gcd(0, 0) = 1', function () {
        let gcd = getGcd(0, 0);
        assert(gcd === 1);
    });

    it('gcd(0, 1) = 1', function () {
        let gcd = getGcd(0, 1);
        assert(gcd === 1);
    });

    it('gcd(1, 0) = 1', function () {
        let gcd = getGcd(1, 0);
        assert(gcd === 1);
    });

    it('gcd(30, 6) = 6', function () {
        let gcd = getGcd(30, 6);
        assert(gcd === 6);
    });

    it('gcd(30, 42) = 6', function () {
        let gcd = getGcd(30, 42);
        assert(gcd === 6);
    });

    it('gcd(30, 42) = gcd(42, 30)', function () {
        let gcd1 = getGcd(30, 42);
        let gcd2 = getGcd(42, 30);
        assert(gcd1 === gcd2);
    });
});