'use strict';

import { getGcd } from '../../modules/equations/gcd.js';
import Value from '../../models/equations/value.js';
import Variable from '../../models/equations/variable.js';
import VariableValue from '../../models/equations/variableValue.js';
import TermSum from '../../models/equations/termSum.js';
import Equation from './equation.js';

function Term(values, variables) {
    this._values = [];
    this._variables = [];
    if (values) {
        if (Array.isArray(values)) {
            this.addValues(values);
        } else {
            this.addValue(values);
        }
    }
    if (variables) {
        if (Array.isArray(variables)) {
            this.addVariables(variables);
        } else {
            this.addVariable(variables);
        }
    }
}

Term.prototype = {

    add(term) {
        if (!term) {
            throw 'Term.add: No term.';
        }
        if (!term instanceof Term) {
            throw 'Term.add: Wrong object type.';
        }
        if (!this.variablesDegreesEqual(term)) {
            throw 'Term.add: Variables not equal.';
        }

        if (term.is0()) {
            return this.copy();
        }
        if (this.is0()) {
            return term.copy();
        }

        let num1 = this.getValues().filter((x) => x.getExponent() > 0);
        let num2 = term.getValues().filter((x) => x.getExponent() > 0);
        let denom1 = this.getValues().filter((x) => x.getExponent() < 0);
        let denom2 = term.getValues().filter((x) => x.getExponent() < 0);

        //Fraction multiplication for sum
        if (!this.sameValues(denom1, denom2)) {
            let diff1 = this.getTermDiff(denom1, denom2);
            let diff2 = this.getTermDiff(denom2, denom1);
            let m1 = new Term(num1).multiply(diff1).getValues();
            let m2 = new Term(num2).multiply(diff2).getValues();
            let newDenominator = this.findCommonsTerm(denom1, denom2);
            let new1 = new Term(newDenominator, this.getVariables()).addValues(m1);
            let new2 = new Term(newDenominator, this.getVariables()).addValues(m2);
            return new1.add(new2);
        }

        if (num1.length === 0 && num2.length === 0) {
            return new Term(null, this.getVariables());
        }

        if (this.getVariables().length === 0) {
            if (num1.length !== 0 && num2.length === 0) {
                return this.copy();
            }
            if (num1.length === 0 && num2.length !== 0) {
                return term.copy();
            }
        }

        //Simple sum
        if (num1.length === 1 &&
            num2.length === 1 &&
            num1[0].isNaturalNumber() &&
            num2[0].isNaturalNumber()) {
            let newTerm = new Term(denom1, this.getVariables());
            let newSum = num1[0].add(num2[0]);
            if (!newSum.is0() || newTerm.getVariables().length !== 0) {
                newTerm.addValue(newSum);
            }
            return newTerm;
        }

        let diff1 = this.getDiff(num1, num2);
        let diff2 = this.getDiff(num2, num1);
        let common = this.getCommonValues(num1, num2);

        //Same complicated value twice
        if (diff1.length === 0 && diff2.length === 0) {
            return this.copy().multiply(new Value(2));
        }

        //Only difference is a single number at both sides.
        if (diff1.length === 1 &&
            diff2.length === 1 &&
            diff1[0].isNaturalNumber() &&
            diff2[0].isNaturalNumber()) {
            let newTerm = new Term(common, this.getVariables())
                .addValue(diff1[0].add(diff2[0]));
            return newTerm;
        }

        //Paranthesis multiplication
        if (diff1.length > 1 || diff2.length > 1) {
            let sum = new TermSum();
            sum.add(diff1);
            sum.add(diff2);
            let newTerm = new Term(common, this.getVariables()).addValue(sum);
            return newTerm;
        }


        //One of the terms have 0 difference. Change other.
        let diff = diff1.length > 0 ? diff1 : diff2;


        //Difference is one number, raise it.
        if (diff.length === 1 && diff[0].isNaturalNumber()) {
            let newTerm = new Term(common, this.getVariables())
                .addValue(diff[0].add(new Value(1)));
            return newTerm;
        } else {
            //Create new 1
            let newTerm = new Term();
            let newSum = new TermSum();
            newSum.add(diff);
            newSum.add(new Value(1));
            newTerm.addValue(newSum);
            newTerm.addValue(common);
            newTerm.addVariables(this.getVariables());
            return newTerm;
        }
    },

    subtract(term) {
        if (!term) {
            throw 'Term.subtract: No term.';
        }
        if (!term instanceof Term) {
            throw 'Term.subtract: Wrong object type.';
        }
        if (!this.variablesDegreesEqual(term)) {
            throw 'Term.subtract: Wrong operation.';
        }
        return this.add(term.multiply(new Term(-1)));
    },

    multiply(term) {
        if (!term instanceof Term) {
            throw 'Term.multiply: Wrong object type.';
        }
        let newTerm = this.copy();
        for (let var1 of term.getVariables()) {
            let var2 = newTerm.getVariables()
                .find((x) => x.getName() === var1.getName() &&
                    x.getRoot() === var1.getRoot());
            if (var2) {
                var2.setExponent(var1.getExponent() + var2.getExponent());
            } else {
                newTerm.addVariable(var1.copy());
            }
        }
        for (let val1 of term.getValues()) {
            let val2 = newTerm.getValues().find(function (x) {
                return x.getRoot() === val1.getRoot() &&
                    x.sameExponentSign(val1);
            });
            if (val2) {
                val2.setNumber(
                    Math.pow(val1.getNumber(), Math.abs(val1.getExponent())) *
                    val2.getNumber());
            } else {
                newTerm.addValue(val1.copy());
            }
        }
        return newTerm.simplify();
    },

    divide(term) {
        if (!term instanceof Term) {
            throw 'Term.multiply: Wrong object type.';
        }
        let newTerm = term.copy();
        for (let var1 of newTerm.getVariables()) {
            var1.setExponent(var1.getExponent() * -1);
        }
        for (let val1 of newTerm.getValues()) {
            val1.setExponent(val1.getExponent() * -1);
        }
        return this.multiply(newTerm);
    },

    exp(num) {
        if (num === 1) {
            return this.copy();
        }
        let newTerm = new Term();
        for (let val of this.getValues()) {
            newTerm.addValue(val.exp(num));
        }
        for (let variable of this.getVariables()) {
            newTerm.addVariable(variable.exp(num));
        }
        return newTerm;
    },

    root(num) {
        if (num === 1) {
            return this.copy();
        }
        let newTerm = new Term();
        for (let val of this.getValues()) {
            for (let val2 of val.root(num)) {
                newTerm.addValue(val2);
            }
        }
        for (let variable of this.getVariables()) {
            newTerm.addVariable(variable.root(num));
        }
        return newTerm;
    },

    reverse() {
        let newTerm = this.copy();
        for (let var1 of newTerm.getVariables()) {
            var1.setExponent(var1.getExponent() * -1);
        }
        for (let val of newTerm.getValues()) {
            val.setExponent(val.getExponent() * -1);
        }
        return newTerm.simplify();
    },

    simplify() {
        let newTerm = new Term();

        for (let var1 of this._variables) {
            if (var1.getExponent() === 0) {
                continue;
            }
            let found = newTerm.getVariables().find((x) => x.getName() === var1.getName());
            if (found) {
                found.setExponent(found.getExponent() + var1.getExponent());
                if (found.getExponent() === 0) {
                    newTerm._variables.splice(newTerm._variables.indexOf(found), 1);
                }
            } else {
                newTerm.addVariable(var1.copy());
            }
        }

        for (let val of this._values) {
            if (val.getNumber() === 0) {
                return new Term();
            }
            if (val.getExponent() === 0) {
                continue;
            }
            if (val.getNumber() === 1 && val.getExponent() < 0) {
                continue;
            }
            if (val.getNumber() === 1 && newTerm.getVariables().length > 0) {
                continue;
            }
            let calculated = Math.pow(val.getNumber(), Math.abs(val.getExponent()));
            let root = val.getRoot();
            if (root > 1) {
                let temp = Math.pow(calculated, 1 / root);
                if (Math.pow(temp, root) === calculated) {
                    calculated = temp;
                    root = 1;
                }
            }
            let found = newTerm.getValues().find((x) => x.getRoot() === root);
            if (found) {
                if (found.sameExponentSign(val)) {
                    found.setNumber(found.getNumber() * calculated);
                } else if (val.getNumber() === -1) {
                    found.setNumber(found.getNumber() * -1);
                } else {
                    let gcd = getGcd(calculated, found.getNumber());
                    if (gcd !== 1) {
                        found.setNumber(found.getNumber() / gcd);
                        let newValue = val.getNumber() / gcd;
                        if (newValue !== 1) {
                            newTerm.addValue(
                                new Value(newValue, val.getExponent(), root));
                        }
                    } else {
                        newTerm.addValue(val.copy());
                    }
                }
            } else {
                newTerm.addValue(new Value(calculated,
                    val.getExponent() > 0 ? 1 : -1,
                    val.getRoot()));
            }
        }

        return newTerm;
    },

    variablesDegreesEqual(term) {
        if (this._variables.length !== term.getVariables().length) {
            return false;
        }
        for (let i = 0; i < this._variables.length; i++) {
            let var1 = this._variables[i];
            let var2 = term.getVariable(i);
            if (!var1.sameDegree(var2)) {
                return false;
            }
        }
        return true;
    },

    sameDegrees(term) {
        if (this.getValues().length !== term.getValues().length) {
            return false;
        }
        return true;
    },

    getGcd(term) {
        if (!term) {
            throw ('Term.getGcd: Missing parameter');
        }
        if (!term instanceof Term) {
            throw 'Term.getGcd: Wrong type';
        }

        let els = term.getValues();
        let newValues = [];
        for (let el of this.getValues()) {
            let counterEl = els.find((x) =>
                x.getRoot() === el.getRoot() &&
                x.getExponent() === el.getExponent());
            if (counterEl) {
                newValues.push(el.getGcd(counterEl));
            }
        }

        let vars = term.getVariables();
        let newVariables = [];
        for (let el of this.getVariables()) {
            let counterEl = vars.find((x) => x.getExponent() === el.getExponent());
            if (counterEl) {
                newVariables.push(counterEl.copy());
            }
        }

        return new Term(newValues, newVariables);
    },

    getVariables() {
        return this._variables;
    },

    getVariable(i) {
        return this._variables[i];
    },

    getValues() {
        return this._values;
    },

    getValue(i) {
        return this._values[i];
    },

    getOrderedVariableNames() {
        return this._variables.map((x) => x.getName()).sort().join('');
    },

    getMaxValueExp() {
        return this._values.reduce(function (acc, x) {
            if (x.getExponent() > acc) {
                acc = x
            };
            return acc;
        }, Number.MIN_VALUE);
    },

    getMaxValueRoot() {
        return this._values.reduce(function (acc, x) {
            if (x.getRoot() > acc) {
                acc = x.getRoot();
            }
            return acc;
        }, Number.MIN_VALUE);
    },

    getMaxVariableExp() {
        return this._variables.reduce(function (acc, x) {
            if (x.getExponent() > acc) {
                acc = x.getExponent();
            }
            return acc;
        }, Number.MIN_VALUE);
    },

    addVariables(variables) {
        if (!Array.isArray(variables)) {
            throw `Term.addVariables: ${JSON.stringify(variables)} is not an array.`;
        }
        for (let variable of variables) {
            this.addVariable(variable, false);
        }
        this._variables = this._variables.sort(this.orderTermElements);
        return this;
    },

    addVariable(variable, sort) {
        if (variable instanceof Variable) {
            this._variables.push(new VariableValue(variable));
        } else if (variable instanceof VariableValue) {
            this._variables.push(variable);
        } else {
            throw `Term.addVariable: Wrong type. ${JSON.stringify(variable)}`;
        }
        if (sort !== false) {
            this._variables = this._variables.sort(this.orderTermElements);
        }
        return this;
    },

    addValue(value) {
        if (value instanceof Value) {
            this._values.push(value);
        } else if (!isNaN(value)) {
            this._values = [new Value(value)];
        } else {
            throw 'Term.addValue: Wrong value type.';
        }
        this._values = this._values.sort(this.orderTermElements);
        return this;
    },

    addValues(values) {
        if (!Array.isArray(values)) {
            throw `Term.addValues: ${JSON.stringify(values)} is not an array.`;
        }
        for (let value of values) {
            if (!value instanceof Value) {
                throw 'Term.addValues: Wrong value type.';
            }
        }
        this._values.push(...values);
        this._values = this._values.sort(this.orderTermElements);
        return this;
    },

    isValue() {
        return this.getVariables().length === 0;
    },

    isVariable() {
        return this.getVariables().length > 0;
    },

    isKnown() {
        let unknown = this.getVariables().find((x) => !x.isKnown());
        return unknown === null || unknown === undefined;
    },

    isSomeKnown() {
        return this.getVariables().some((x) => x.isKnown());
    },

    orderTermElements(el1, el2) {
        if (el1 instanceof VariableValue && !el2 instanceof VariableValue) {
            return 1;
        }
        if (!el1 instanceof VariableValue && el2 instanceof VariableValue) {
            return -1;
        }
        if (el1 instanceof VariableValue && el2 instanceof VariableValue) {
            return el1.getName() > el2.getName();
        }

        if (el1 instanceof TermSum && !el2 instanceof TermSum) {
            return 1;
        }
        if (!el1 instanceof TermSum && el2 instanceof TermSum) {
            return -1;
        }
        if (el1 instanceof TermSum && el2 instanceof TermSum) {
            return el1.elements.length > el2.elements.length;
        }

        if (el1.getExponent() > el2.getExponent()) {
            return -1;
        }
        if (el1.getExponent() < el2.getExponent()) {
            return 1;
        }

        if (el1.getRoot() > el2.getRoot()) {
            return 1;
        }
        if (el1.getRoot() < el2.getRoot()) {
            return -1;
        }

        if (el1.getNumber() > el2.getNumber()) {
            return 1;
        }
        if (el1.getNumber() < el2.getNumber()) {
            return -1;
        }
    },

    sameValues(val1, val2) {
        if (val1.length !== val2.length) {
            return false;
        }
        for (let i = 0; i < val1.length; i++) {
            let var1 = val1[i];
            let var2 = val2[i];
            if (!var1.equals(var2)) {
                return false;
            }
        }
        return true;
    },

    variablesEqual(term) {
        if (this.getVariables().length !== term.getVariables().length) {
            return false;
        }
        for (let i = 0; i < this._variables.length; i++) {
            let var1 = this.getVariable(i);
            let var2 = term.getVariable(i);
            if (!var1.equals(var2)) {
                return false;
            }
        }
        return true;
    },

    getDiff(term1, term2) {
        let diffArray = [];
        for (let t of term1) {
            let found = term2.find(function (x) {
                return x.getExponent() === t.getExponent() &&
                    x.getRoot() === t.getRoot() &&
                    x.getNumber() === t.getNumber();
            });
            if (!found) {
                diffArray.push(t);
            }
        }
        return diffArray;
    },

    getTermDiff(term1, term2) {
        return new Term(this.getDiff(term1, term2));
    },

    findCommonsTerm(term1, term2) {
        return new Term(this.getCommonValues(term1, term2));
    },

    getCommonValues(term1, term2) {
        let sameArray = [];
        for (let term of term1) {
            let found = term2.find((x) => x.equals(term));
            if (found) {
                sameArray.push(term);
            }
        }
        return sameArray;
    },

    isNaturalNumber() {
        return this.isValue() &&
            this._values.length === 1 &&
            this._values[0].isNaturalNumber();
    },

    is0() {
        if (this._values.length === 0 && this._variables.length === 0) {
            return true;
        }

        let zeroElement = this._values.find((x) => x.is0());
        if (zeroElement) {
            return true;
        }
        return false;
    },

    isPositive() {
        let num = this._values.find((x) => x.isNaturalNumber());
        return !num || num.getNumber() > 0;
    },

    copy() {
        let newTerm = new Term();
        for (let variable of this.getVariables()) {
            newTerm.addVariable(variable.copy());
        }
        for (let value of this.getValues()) {
            newTerm.addValue(value.copy());
        }
        return newTerm;
    },

    equals(term) {
        if (!term instanceof Term) {
            throw 'Term.equals wrong object type.';
        }
        if (this.getValues().length !== term.getValues().length) {
            return false;
        }
        if (this.getVariables().length !== term.getVariables().length) {
            return false;
        }
        for (let i = 0; i < this.getValues().length; i++) {
            let val1 = this.getValue(i);
            let val2 = term.getValue(i);
            if (!val1.equals(val2)) {
                return false;
            }
        }
        for (let i = 0; i < this.getVariables().length; i++) {
            let var1 = this.getVariable(i);
            let var2 = term.getVariable(i);
            if (!var1.equals(var2)) {
                return false;
            }
        }
        return true;
    },

    toString() {
        if (this.getValues().length === 0 && this.getVariables() === 0) {
            '0';
        }
        let numValues = this.getValues()
            .filter((val) => val instanceof Value && val.getExponent() >= 0);
        let denomValues = this.getValues()
            .filter((val) => val instanceof Value && val.getExponent() < 0);
        let numVariables = this.getVariables()
            .filter((val) => val instanceof VariableValue && val.getExponent() >= 0);
        let denomVariables = this.getVariables()
            .filter((val) => val instanceof VariableValue && val.getExponent() < 0);

        let numStr = '';

        if (numValues.length > 0) {
            numStr += numValues.map(function (x) {
                if (x.isNaturalNumber()) {
                    if (x.getNumber() === -1) {
                        return '- ';
                    } else {
                        return x.toString();
                    }
                }
                return x.toString();
            }).join('');
        }

        if (numVariables.length > 0) {
            numStr += numVariables.map((x) => x.toString()).join('.');
        }

        if (denomValues.length === 0 && denomVariables.length === 0) {
            return numStr;
        }

        let denomStr =
            (denomValues.length > 0 ?
                denomValues.map((x) => x.toString()).join('') :
                '') +
            (denomVariables.length > 0 ?
                denomVariables.map((x) => x.toString()).join('') :
                '');

        if (numVariables.length === 0 &&
            numValues.length === 0 &&
            (denomValues.length > 0 || denomVariables.length > 0)) {
            numStr += "1";
        }

        return `<span class="frac">
            <sup>${numStr}</sup>
            <span>&frasl;</span>
            <sub>${denomStr}</sub></span>`;
    }
}

export default Term;