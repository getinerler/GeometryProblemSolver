'use strict';

import Value from '../../models/equations/value.js';
import { it, assert } from '../test.js';

document.addEventListener('DOMContentLoaded', function () {

    console.log('Check value...');

    it('2 + 2 = 4.', function () {
        let val1 = new Value(2);
        let val2 = new Value(2);
        let newValue = val1.add(val2);
        assert(newValue instanceof Value);
        assert(newValue.equals(new Value(4)));
    });

    it('5 - 2 = 3', function () {
        let val1 = new Value(5);
        let val2 = new Value(2);
        let newValue = val1.subtract(val2);
        assert(newValue instanceof Value);
        assert(newValue.equals(new Value(3)));
    });

    it('5 x 2 = 10', function () {
        let val1 = new Value(5);
        let val2 = new Value(2);
        let newValue = val1.multiply(val2);
        assert(newValue instanceof Value);
        assert(newValue.equals(new Value(10)));
    });

    it('5 x 5² = 5³', function () {
        let val1 = new Value(5);
        let val2 = new Value(5, 2);
        let newValue = val1.multiply(val2);
        assert(newValue instanceof Value);
        assert(newValue.equals(new Value(5, 3)));
    });

    it('Value gcd(30, 6) = 6', function () {
        let val1 = new Value(30);
        let val2 = new Value(6);
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Value);
        assert(newValue.equals(new Value(6)));
    });

    it('Value gcd(30, 42) = 6', function () {
        let val1 = new Value(30);
        let val2 = new Value(42);
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Value);
        assert(newValue.equals(new Value(6)));
    });

    it('Value gcd(√15, √5) = √5', function () {
        let val1 = new Value(15, 1, 2);
        let val2 = new Value(5, 1, 2);
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Value);
        assert(newValue.equals(new Value(5, 1, 2)));
    });

    it('Value gcd(1/15, 1/3) = 1/5', function () {
        let val1 = new Value(15, -1, 1);
        let val2 = new Value(5, -1, 1);
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Value);
        assert(newValue.equals(new Value(5, -1)));
    });
});