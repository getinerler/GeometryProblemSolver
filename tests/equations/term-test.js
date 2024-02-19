'use strict';

import Value from '../../models/equations/value.js';
import Variable from '../../models/equations/variable.js';
import VariableValue from '../../models/equations/variableValue.js';
import Term from '../../models/equations/term.js';
import { it, assert } from '../test.js';

document.addEventListener('DOMContentLoaded', function () {

    console.log('Check term...');

    it('Simplify 4/2 = 2.', function () {
        let val1 = new Value(4);
        let val2 = new Value(2, -1);
        let term1 = new Term([val1, val2]);
        let newValue = term1.simplify();
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(2)));
    });

    it('Simplify 4a/2 = 2a.', function () {
        let val1 = new Value(4);
        let val2 = new Value(2, -1);
        let a = new Variable('a');
        let term1 = new Term([val1, val2], new VariableValue(a));
        let newValue = term1.simplify();
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(2, new VariableValue(a))));
    });

    it('Simplify 4.4/2.2 = 4.', function () {
        let val1 = new Value(4);
        let val2 = new Value(4);
        let val3 = new Value(2, -1);
        let val4 = new Value(2, -1);
        let term1 = new Term([val1, val2, val3, val4]);
        let newValue = term1.simplify();
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(4)));
    });

    it('Simplify 4a/2ab = 2/b.', function () {
        let a = new Variable('a');
        let b = new Variable('b');
        let val1 = new Value(4);
        let val2 = new Value(2, -1);
        let term1 = new Term([val1, val2],
            [
                new VariableValue(a),
                new VariableValue(a, -1),
                new VariableValue(b, -1)
            ]
        );
        let newValue = term1.simplify();
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(2, new VariableValue(b, -1))));
    });

    it('Simplify 4√5/2 = 2/√5.', function () {
        let val1 = new Value(4);
        let val2 = new Value(5, 1, 2);
        let val3 = new Value(2, -1);
        let val4 = new Value(2);
        let val5 = new Value(5, 1, 2);
        let term1 = new Term([val1, val2, val3]);
        let newValue = term1.simplify();
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term([val4, val5])));
    });

    it('Simplify a²/ab = a/b.', function () {
        let a = new Variable('a');
        let b = new Variable('b');
        let term1 = new Term(null,
            [
                new VariableValue(a, 2),
                new VariableValue(a, -1),
                new VariableValue(b, -1)
            ]);
        let term2 = new Term(null, a).addVariable(new VariableValue(b, -1));
        let newValue = term1.simplify();
        assert(newValue instanceof Term);
        assert(newValue.equals(term2));
    });

    it('2 + 2 = 4.', function () {
        let val1 = new Value(2);
        let val2 = new Value(2);
        let term1 = new Term(val1);
        let term2 = new Term(val2);
        let newValue = term1.add(term2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(4)));
    });

    it('2 - 2 = 0.', function () {
        let val1 = new Value(2);
        let val2 = new Value(2);
        let term1 = new Term(val1);
        let term2 = new Term(val2);
        let newValue = term1.subtract(term2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term()));
    });

    it('2 - 3 = -1.', function () {
        let val1 = new Value(2);
        let val2 = new Value(3);
        let term1 = new Term(val1);
        let term2 = new Term(val2);
        let newValue = term1.subtract(term2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(-1)));
    });

    it('2a + 3a = 5a.', function () {
        let a = new Variable('a');
        let term1 = new Term(new Value(2), a);
        let term2 = new Term(new Value(3), a);
        let newValue = term1.add(term2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(5, a)));
    });

    it('2.3² + 4.3² = 6.3²', function () {
        let term1 = new Term([new Value(2), new Value(3, 2)]);
        let term2 = new Term([new Value(4), new Value(3, 2)]);
        let newValue = term1.add(term2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(6).addValue(new Value(3, 2))));
    });

    it('6.3²4³ + 3²4³ = 7.3²4³', function () {
        let term1 = new Term([new Value(6), new Value(3, 2), new Value(4, 3)]);
        let term2 = new Term([new Value(3, 2), new Value(4, 3)]);
        let newValue = term1.add(term2);
        let checkValue = new Term([new Value(7), new Value(3, 2), new Value(4, 3)]);
        assert(newValue instanceof Term);
        assert(newValue.equals(checkValue));
    });

    it('2/5 + 1/5 = 3/5', function () {
        let term1 = new Term([new Value(2), new Value(5, -1)]);
        let term2 = new Term([new Value(1), new Value(5, -1)]);
        let newValue = term1.add(term2);
        let checkValue = new Term([new Value(3), new Value(5, -1)]);
        assert(newValue instanceof Term);
        assert(newValue.equals(checkValue));
    });

    it('5 - 2 = 3', function () {
        let term1 = new Term(5);
        let term2 = new Term(2);
        let newValue = term1.subtract(term2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(3)));
    });

    it('5 x 2 = 10', function () {
        let term1 = new Term(5);
        let term2 = new Term(2);
        let newValue = term1.multiply(term2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(10)));
    });

    it('10 / 2 = 5', function () {
        let term1 = new Term(10);
        let term2 = new Term(2);
        let newValue = term1.divide(term2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(5)));
    });

    it('Term gcd(30, 6) = 6', function () {
        let val1 = new Term(30);
        let val2 = new Term(6);
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(6)));
    });

    it('Term gcd(30, 42) = 6', function () {
        let val1 = new Term(30);
        let val2 = new Term(42);
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(6)));
    });

    it('Term gcd(√15, √5) = √5', function () {
        let val1 = new Term(new Value(15, 1, 2));
        let val2 = new Term(new Value(5, 1, 2));
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(new Value(5, 1, 2))));
    });

    it('Term gcd(1/15, 1/3) = 1/5', function () {
        let val1 = new Term(new Value(15, -1, 1));
        let val2 = new Term(new Value(5, -1, 1));
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(new Value(5, -1, 1))));
    });

    it('Term gcd(3a, 15a) = 3a', function () {
        let a = new Variable('a');
        let val1 = new Term(3, a);
        let val2 = new Term(15, a);
        let newValue = val1.getGcd(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(3, a)));
    });

    it('5 x 5² = 5³', function () {
        let val1 = new Term(5);
        let val2 = new Term(new Value(5, 2));
        let newValue = val1.multiply(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(125)));
    });

    it('5√5 - 2√5 = 3√5', function () {
        let val1 = new Term(5).addValue(new Value(5, 1, 2));
        let val2 = new Term(2).addValue(new Value(5, 1, 2));
        let newValue = val1.subtract(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(3).addValue(new Value(5, 1, 2))));
    });

    it('2√5 + 3√5 = 5√5', function () {
        let val1 = new Term(2).addValue(new Value(5, 1, 2));
        let val2 = new Term(3).addValue(new Value(5, 1, 2));
        let newValue = val1.add(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(5).addValue(new Value(5, 1, 2))));
    });

    it('2√5 x 3√5 = 30', function () {
        let val1 = new Term(2).addValue(new Value(5, 1, 2));
        let val2 = new Term(3).addValue(new Value(5, 1, 2));
        let newValue = val1.multiply(val2);
        assert(newValue instanceof Term);
        assert(newValue.equals(new Term(30)));
    });

});