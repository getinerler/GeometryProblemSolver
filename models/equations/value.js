'use strict';

import { getGcd } from '../../modules/equations/gcd.js';
import Term from '../../models/equations/term.js';
import TermSum from '../../models/equations/termSum.js';

function Value(number, exponent, root) {
    this._number = number || 0;
    this._exponent = exponent || 1;
    this._root = root || 1;
}

Value.prototype = {

    add(val) {
        if (this._exponent === val.getExponent() && this._root === val.getRoot()) {
            return new Value(
                this._number + val.getNumber(),
                this._exponent,
                this._root);
        }
        let sum = new TermSum();
        sum.push(this.copy());
        sum.push(val.copy());
        return sum;
    },

    subtract(val) {
        if (this._exponent === val.getExponent() && this._root === val.getRoot()) {
            return new Value(
                this._number - val.getNumber(),
                val._exponent,
                val._root);
        }
        let sum = new TermSum();
        sum.push(this.copy());
        sum.push(val.multiplyNumber(-1));
        return sum;
    },

    multiply(val) {
        if (this._exponent === val.getExponent() && this._root === val.getRoot()) {
            return new Value(
                this._number * val.getNumber(),
                this._exponent,
                this._root).trySimplifying();
        } else if (this._number === val.getNumber() && this._root === val.getRoot()) {
            return new Value(
                this._number,
                this._exponent + val.getExponent(),
                this._root).trySimplifying();
        } else {
            return new Term(this.copy()).addValue(num);
        }
    },

    divide(number) {

    },

    getGcd(val) {
        if (this.getExponent() !== val.getExponent()) {
            throw 'Value.getGcd: Exponents don\'t match.';
        }
        if (this.getRoot() !== val.getRoot()) {
            throw 'Value.getGcd: Roots don\'t match.';
        }
        let gcd = getGcd(Math.abs(this.getNumber()), Math.abs(val.getNumber()));
        return new Value(gcd, this.getExponent(), this.getRoot());
    },

    sameDegree(val) {
        return this._exponent === val.getExponent() && this._root === val.getRoot();
    },

    trySimplifying() {
        if (this._root === 1) {
            return this.copy();
        }
        let multiplied = Math.pow(this._number, this._exponent);
        let rootTemp = Math.pow(multiplied, 1 / this._root);
        if (Math.pow(rootTemp, this._root) === multiplied) {
            return new Value(rootTemp, 1, 1);
        }
        return this.copy();
    },

    sameExponentSign(val) {
        return val.getExponent() > 0 && this.getExponent() > 0 ||
            val.getExponent() < 0 && this.getExponent() < 0;
    },

    is0() {
        return this._number === 0;
    },

    is1() {
        return this._number === 1 && this._exponent === 1 && this._root === 1;
    },

    isNaturalNumber() {
        return this._exponent === 1 && this._root === 1;
    },

    exp(pow) {
        let newValue = this.copy();
        if (pow < 0) {
            newValue.setExponent(newValue.getExponent() * -1);
        }
        let absPow = Math.abs(pow);
        if (absPow === 1) {
            return newValue;
        }
        newValue.setNumber(Math.pow(newValue.getNumber(), absPow));
        return newValue;
    },

    root(pow) {
        let newValue = this.copy();
        if (pow === 1) {
            return newValue;
        }
        if (newValue.getRoot() === 1) {
            let newNum = this.copy();
            let rawNumber = Math.pow(
                newValue.getNumber(),
                Math.abs(newValue.getExponent()));

            let rootTemp = Math.pow(rawNumber, 1 / pow);
            if (Math.pow(rootTemp, pow) === rawNumber) {
                newNum.setExponent(1);
                newNum.setRoot(1);
                newNum.setNumber(rootTemp);
            }
            return newNum;
        } else {
            throw 'Value.root: Root of the rooted value.';
        }
    },

    getNumber() {
        return this._number;
    },

    setNumber(number) {
        this._number = number;
        return this;
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

    copy() {
        return new Value(this._number, this._exponent, this._root);
    },

    equals(val) {
        if (this.getNumber() !== val.getNumber()) {
            return false;
        }
        if (this.getExponent() !== val.getExponent()) {
            return false;
        }
        if (this.getRoot() !== val.getRoot()) {
            return false;
        }
        return true;
    },

    toString() {
        let str = '';
        if (this._root > 1) {
            str += `√<span style="text-decoration:overline">${this._root}</span>`;
        }
        str += this._number;
        if (Math.abs(this._exponent) !== 1) {
            str += `<sup style="font-size:9px">${Math.abs(this._exponent)}</sup>`;
        }
        return str;
    }
}

export default Value;