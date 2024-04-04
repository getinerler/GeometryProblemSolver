'use strict'

import Equation from '../../models/equations/equation.js';
import Value from '../../models/equations/value.js';
import Variable from '../../models/equations/variable.js';
import VariableValue from '../../models/equations/variableValue.js';
import Term from '../../models/equations/term.js';
import Calculator from '../../modules/equations/calculator.js';
import { it, assert } from '../test.js';
import { getOnlyEquationsText } from '../../modules/graphic/texts.js';

document.addEventListener('DOMContentLoaded', function () {

    console.log('Check calculator...');

    it('Equation: a = 10. Find a.', function () {
        let a = new Variable('a');

        let eq = new Equation();
        eq.addLeftTerm(new Term(null, a));
        eq.addRightTerm(new Term(10));

        let eqs = [eq];
        let unknown = 'a';
        let solve = new Calculator(eqs, unknown, [], [a]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(10)));
    });

    it('Equation: a² = 25. Find a.', function () {
        let a = new Variable('a');

        let eq = new Equation();
        eq.addLeftTerm(new Term(null, new VariableValue(a, 2)));
        eq.addRightTerm(new Term(25));

        let eqs = [eq];
        let unknown = 'a';
        let solve = new Calculator(eqs, unknown, [], [a]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(5)));
    });

    it('Equation: 20 + 10 + a = 100. Find a.', function () {
        let a = new Variable('a');

        let eq = new Equation();
        eq.addLeftTerm(new Term(20));
        eq.addLeftTerm(new Term(10));
        eq.addLeftTerm(new Term(1, a));
        eq.addRightTerm(new Term(100));

        let eqs = [eq];
        let unknown = 'a';
        let solve = new Calculator(eqs, unknown, [], [a]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(70)));
    });

    it('Equation: a + b + c = 100. b = 20. c = 10. Find a.', function () {
        let a = new Variable('a');
        let b = new Variable('b', [new Value(20)]);
        let c = new Variable('c', [new Value(10)]);

        let eq = new Equation();
        eq.addLeftTerm(new Term(null, a));
        eq.addLeftTerm(new Term(null, b));
        eq.addLeftTerm(new Term(null, c));
        eq.addRightTerm(new Term(100));

        let eqs = [eq];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a, b, c]).solve();

        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(70)));
    });

    it('Equation: 20 + a + 30 + 40 = 100. Find a.', function () {
        let a = new Variable('a');

        let eq = new Equation();
        eq.addLeftTerm(new Term(20));
        eq.addLeftTerm(new Term(null, a));
        eq.addLeftTerm(new Term(30));
        eq.addLeftTerm(new Term(40));
        eq.addRightTerm(new Term(100));

        let eqs = [eq];
        let unknown = 'a';
        let solve = new Calculator(eqs, unknown, [], [a]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(10)));
    });

    it('Equations: 2a + 3b = 16, a + 2b = 9. Find b.', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(2, a));
        eq1.addLeftTerm(new Term(3, b));
        eq1.addRightTerm(new Term(16));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(1, a));
        eq2.addLeftTerm(new Term(2, b));
        eq2.addRightTerm(new Term(9));

        let eqs = [eq1, eq2];
        let unknown = 'b';

        let solve = new Calculator(eqs, unknown, [], [a, b]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(2)));
    });

    it('Equations: a² + b² = 25, a = 3. Find b.', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(null, new VariableValue(a, 2)));
        eq1.addLeftTerm(new Term(null, new VariableValue(b, 2)));
        eq1.addRightTerm(new Term(new Value(25)));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(null, a));
        eq2.addRightTerm(new Term(new Value(3)));

        let eqs = [eq1, eq2];
        let unknown = 'b';

        let solve = new Calculator(eqs, unknown, [], [a, b]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals((new Value(4))));
    });

    it('Equations: a² + b² + 3 = 28, a = 3. Find b.', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(null, new VariableValue(a, 2)));
        eq1.addLeftTerm(new Term(null, new VariableValue(b, 2)));
        eq1.addLeftTerm(new Term(3));
        eq1.addRightTerm(new Term(28));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(null, a));
        eq2.addRightTerm(new Term(3));

        let eqs = [eq1, eq2];
        let unknown = 'b';

        let solve = new Calculator(eqs, unknown, [], [a, b]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(4)));
    });

    it('Equations: a/b = 5, b = 2. Find a.', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(null, a).addVariable(new VariableValue(b, -1)));
        eq1.addRightTerm(new Term(5));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(null, b));
        eq2.addRightTerm(new Term(2));

        let eqs = [eq1, eq2];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a, b]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(10)));
    });

    it('Equations: a/b + 10 = 15, b = 2. Find a.', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(null, a).addVariable(new VariableValue(b, -1)));
        eq1.addLeftTerm(new Term(10));
        eq1.addRightTerm(new Term(15));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(null, b));
        eq2.addRightTerm(new Term(2));

        let eqs = [eq1, eq2];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a, b]).solve();

        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(10)));
    });

    it('Equations: a/2b = 5, b = 2. Find a.', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(new Value(2, -1), [a, new VariableValue(b, -1)]));
        eq1.addLeftTerm(new Term(10));
        eq1.addRightTerm(new Term(15));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(null, b));
        eq2.addRightTerm(new Term(2));

        let eqs = [eq1, eq2];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a, b]).solve();

        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(20)));
    });

    it('Equations: a/2 + b/3 = 5, b = 9. Find a.', function () {
        let a = new Variable('a');
        let b = new Variable('b');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(new Value(2, -1), a));
        eq1.addLeftTerm(new Term(new Value(3, -1), b));
        eq1.addRightTerm(new Term(5));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(null, b));
        eq2.addRightTerm(new Term(9));

        let eqs = [eq1, eq2];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a, b]).solve();

        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(4)));
    });

    it('Equations: a/b + c/2 = 7, b = 2, c = 10. Find a.', function () {
        let a = new Variable('a');
        let b = new Variable('b');
        let c = new Variable('c');

        let eq1 = new Equation();
        eq1.addLeftTerm(new Term(null, [new VariableValue(a), new VariableValue(b, -1)]));
        eq1.addLeftTerm(new Term(new Value(2, -1), c));
        eq1.addRightTerm(new Term(7));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(null, b));
        eq2.addRightTerm(new Term(2));

        let eq3 = new Equation();
        eq3.addLeftTerm(new Term(null, c));
        eq3.addRightTerm(new Term(10));

        let eqs = [eq1, eq2, eq3];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a, b, c]).solve();

        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(4)));
    });

    it('Equations: a/bc = 5, b = 2, c = 3. Find a.', function () {
        let a = new Variable('a');
        let b = new Variable('b');
        let c = new Variable('c');

        let eq1 = new Equation();
        let term1 = new Term(null, a)
            .addVariable(new VariableValue(b, -1))
            .addVariable(new VariableValue(c, -1));
        eq1.addLeftTerm(term1);
        eq1.addRightTerm(new Term(5));

        let eq2 = new Equation();
        eq2.addLeftTerm(new Term(null, b));
        eq2.addRightTerm(new Term(2));

        let eq3 = new Equation();
        eq3.addLeftTerm(new Term(null, c));
        eq3.addRightTerm(new Term(3));

        let eqs = [eq1, eq2, eq3];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a, b, c]).solve();

        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(30)));
    });

    it('Equation: √a = 5. Find a.', function () {
        let a = new Variable('a');

        let eq = new Equation();
        eq.addLeftTerm(new Term(null, new VariableValue(a, 1, 2)));
        eq.addRightTerm(new Term(5));
        let eqs = [eq];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(25)));
    });

    it('Equation: ∛a = 5. Find a.', function () {
        let a = new Variable('a');

        let eq = new Equation();
        eq.addLeftTerm(new Term(null, new VariableValue(a, 1, 3)));
        eq.addRightTerm(new Term(5));
        let eqs = [eq];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(125)));
    });

    it('Equation: √a + 5 = 10. Find a.', function () {
        let a = new Variable('a');

        let eq = new Equation();
        eq.addLeftTerm(new Term(null, new VariableValue(a, 1, 2)));
        eq.addLeftTerm(new Term(5));
        eq.addRightTerm(new Term(10));
        let eqs = [eq];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        assert(solve.value[0].equals(new Value(25)));
    });

    it('Equation: a² = 125. Find a.', function () {
        let a = new Variable('a');

        let eq = new Equation();
        eq.addLeftTerm(new Term(null, new VariableValue(a, 2, 1)));
        eq.addRightTerm(new Term(125));
        let eqs = [eq];
        let unknown = 'a';

        let solve = new Calculator(eqs, unknown, [], [a]).solve();
        assert(solve.solved === true);
        assert(solve.name === unknown);
        //console.log(solve.value)
        assert(solve.value[0].equals(new Value(5)));
        assert(solve.value[1].equals(new Value(5, 1, 2)));
    });
});