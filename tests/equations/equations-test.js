'use strict';

import Equation from '../../models/equations/equation.js';
import Variable from '../../models/equations/variable.js';
import VariableValue from '../../models/equations/variableValue.js';
import Term from '../../models/equations/term.js';
import { it, assert } from '../test.js';

document.addEventListener('DOMContentLoaded', function () {

    console.log('Check equations...');

    it('(5a + 3b = 12) = (5a + 3b = 12)', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(5, a));
        eq1.addLeftTerm(new Term(3, b));
        eq1.addRightTerm(new Term(12));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(5, a));
        eq2.addLeftTerm(new Term(3, b));
        eq2.addRightTerm(new Term(12));

        assert(eq1.equals(eq2));
    });

    it('(6a + 3b = 12) ≠ (5a + 3b = 12)', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(6, a));
        eq1.addLeftTerm(new Term(3, b));
        eq1.addRightTerm(new Term(12));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(5, a));
        eq2.addLeftTerm(new Term(3, b));
        eq2.addRightTerm(new Term(12));

        assert(!eq1.equals(eq2));
    });

    it('(5a + 3b = 12) ≠ (5a + 3b = 10)', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(5, a));
        eq1.addLeftTerm(new Term(3, b));
        eq1.addRightTerm(new Term(12));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(5, a));
        eq2.addLeftTerm(new Term(3, b));
        eq2.addRightTerm(new Term(10));

        assert(!eq1.equals(eq2));
    });

    it('(5a + 3b = 12) - (2a + b = 3) = (3a + 2b = 9)', function () {

        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(5, a));
        eq1.addLeftTerm(new Term(3, b));
        eq1.addRightTerm(new Term(12));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(2, a));
        eq2.addLeftTerm(new Term(1, b));
        eq2.addRightTerm(new Term(3));

        let eq3 = new Equation();
        eq3.addLeftTerm(new Term(3, a));
        eq3.addLeftTerm(new Term(2, b));
        eq3.addRightTerm(new Term(9));

        let diff = eq1.subtract(eq2);

        assert(diff.equals(eq3));
    });

    it('(5a² + 2b = 10) - (a + b = 3) = 5a² - a + b = 7', function () {

        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(5, new VariableValue(a, 2)));
        eq1.addLeftTerm(new Term(2, b));
        eq1.addRightTerm(new Term(10));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(1, a));
        eq2.addLeftTerm(new Term(1, b));
        eq2.addRightTerm(new Term(3));

        let eq3 = new Equation();
        eq3.addLeftTerm(new Term(5, new VariableValue(a, 2)));
        eq3.addLeftTerm(new Term(-1, a));
        eq3.addLeftTerm(new Term(1, b));
        eq3.addRightTerm(new Term(7));

        let diff = eq1.subtract(eq2);

        assert(diff.equals(eq3));
    });
});