'use strict';

import Variable from '../../models/equations/variable.js';
import Term from '../../models/equations/term.js';

function VariableValue(variable, exponent, root) {
    this._variable;
    if (variable) {
        if (!variable instanceof Variable) {
            throw 'VariableValue: Wrong variable agrument. ' +
            JSON.stringify(variable) + '.';
        }
        this._variable = variable;
    } else {
        throw 'No variable.';
    }
    this._exponent = exponent || 1;
    this._root = root || 1;
}

VariableValue.prototype = {

    calculate() {
        let value = this.getValue();
        if (!value) {
            throw 'No value.';
        }
        return new Term(value).exp(this._exponent).root(this._root);
    },

    getVariable() {
        return this._variable;
    },

    getExponent() {
        return this._exponent;
    },

    setExponent(exponent) {
        this._exponent = exponent;
        return this;
    },

    getRoot() {
        return this._root;
    },

    setRoot(root) {
        this._root = root;
        return this;
    },

    getName() {
        return this._variable.getName();
    },

    sameDegree(var1) {
        return this._exponent === var1.getExponent();
    },

    sameVariable(var1) {
        return var1.getName() === this._name && var1.getExponent() === this._exponent;
    },

    getValue() {
        return this._variable.getValue();
    },

    setValue(value) {
        return this._variable.setValue(value);
    },

    isKnown() {
        return this._variable.isKnown();
    },

    pow(num, root) {
        let newVar = this.copy();
        if (!root) {
            newVar._exponent += num;
        } else {
            if (this._exponent > 1) {
                let division = newVar._exponent / num;
                if (newVar._exponent === division * num) {
                    newVar._exponent = division;
                }
            } else {
                this._root = num;
            }
            return newVar;
        }
        return newVar;
    },

    copy() {
        return new VariableValue(this._variable, this._exponent, this._root);
    },

    equals(variable) {
        if (this._variable !== variable.getVariable()) {
            return false;
        }
        if (this._exponent !== variable.getExponent()) {
            return false;
        }
        return true;
    },

    toString() {
        return this._variable.getName() +
            (Math.abs(this._exponent) !== 1 ? `<sup>${Math.abs(this._exponent)}</sup>` : '');
    }
}

export default VariableValue;