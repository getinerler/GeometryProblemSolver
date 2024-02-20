'use strict';

import Term from '../../models/equations/term.js';

window.equationCounter = 1;

function Equation() {
    this._creation = null;
    this._ancestors = [];
    this._ancestorIds = [];
    this._count = window.equationCounter++;
    this._left = [];
    this._right = [];
    this._answer = false;
}

Equation.prototype = {

    subtract(eq2) {
        let newEq = new Equation();
        newEq.setCreation('Subtraction.');
        newEq.setAncestors(this, eq2);
        newEq.setAncestorIds([this.getCount(), eq2.getCount()]);

        for (let var1 of this._left) {
            if (var1.isVariable()) {
                let var2 = eq2.getLeft()
                    .find((x) => x.isVariable() && x.variablesEqual(var1));
                if (var2) {
                    let newValue = var1.subtract(var2);
                    if (!newValue.is0()) {
                        newEq.addLeftTerm(newValue);
                    }
                } else {
                    newEq.addLeftTerm(var1.copy());
                }
            } else if (var1.isValue()) {
                let var2 = eq2.getLeft().find((x) => x.isValue() && x.sameDegrees(var1));
                if (var2) {
                    let newValue = var1.subtract(var2);
                    if (!newValue.is0()) {
                        newEq.addLeftTerm(newValue);
                    }
                } else {
                    newEq.addLeftTerm(var1.copy());
                }
            }
        }

        for (let var1 of eq2.getLeft()) {
            if (var1.isVariable()) {
                let var2 = this._left
                    .find((x) => x.isVariable() && x.variablesEqual(var1));
                if (!var2) {
                    newEq.addLeftTerm(var1.multiply(new Term(-1)));
                }
            } else if (var1.isValue()) {
                let var2 = this._left.find((x) => x.isValue() && x.sameDegrees(var1));
                if (!var2) {
                    newEq.addLeftTerm(var1.multiply(new Term(-1)));
                }
            }
        }

        for (let var1 of this._right) {
            if (var1.isVariable()) {
                let var2 = eq2.getRight()
                    .find((x) => x.isVariable() && x.variablesEqual(var1));
                if (var2) {
                    let newValue = var1.subtract(var2);
                    if (!newValue.is0()) {
                        newEq.addRightTerm(newValue);
                    }
                } else {
                    newEq.addRightTerm(var1.copy());
                }
            } else if (var1.isValue()) {
                let var2 = eq2.getRight().find((x) => x.isValue() && x.sameDegrees(var1));
                if (var2) {
                    let newValue = var1.subtract(var2);
                    if (!newValue.is0()) {
                        newEq.addRightTerm(newValue);
                    }
                } else {
                    newEq.addRightTerm(var1.copy());
                }
            }
        }

        for (let var1 of eq2.getRight()) {
            if (var1.isVariable()) {
                let var2 = this._right
                    .find((x) => x.isVariable() && x.variablesEqual(var1));
                if (!var2) {
                    newEq.addRightTerm(var1.multiply(new Term(-1)));
                }
            } else if (var1.isValue()) {
                let var2 = this._right.find((x) => x.isValue() && x.sameDegrees(var1));
                if (!var2) {
                    newEq.addRightTerm(var1.multiply(new Term(-1)));
                }
            }
        }

        return newEq;
    },

    multiplyTerm(term) {
        let newEquation = new Equation();
        newEquation.setCreation('Term multiplied');
        newEquation.setAncestors(this);
        newEquation.setAncestorIds([this.getCount()]);
        for (let el of this._right.map((x) => x.multiply(term))) {
            newEquation.addRightTerm(el);
        }
        for (let el of this._left.map((x) => x.multiply(term))) {
            newEquation.addLeftTerm(el);
        }
        return newEquation;
    },

    getLeft() {
        return this._left;
    },

    getRight() {
        return this._right;
    },

    getCreation() {
        return this._creation;
    },

    setCreation(creation) {
        this._creation = creation;
        return this;
    },

    getAncestors() {
        return this._ancestors;
    },

    setAncestors(ancestors) {
        this._ancestors = ancestors;
        return this;
    },

    getAncestorIds() {
        return this._ancestorIds;
    },

    setAncestorIds(ids) {
        this._ancestorIds = ids;
        return this;
    },

    isAnswer() {
        return this._answer;
    },

    setAnswer(ans) {
        this._answer = ans;
        return this;
    },

    copy() {
        let newEq = new Equation();
        for (let term of this._left) {
            newEq.addLeftTerm(term.copy());
        }
        for (let term of this._right) {
            newEq.addRightTerm(term.copy());
        }
        return newEq;
    },

    equals(eq) {
        if (this._right.length !== eq.getRight().length) {
            return false;
        }
        if (this._left.length !== eq.getLeft().length) {
            return false;
        }
        for (let i = 0; i < this._left.length; i++) {
            let term1 = this._left[i];
            let term2 = eq.getLeft()[i];
            if (!term1.equals(term2)) {
                return false;
            }
        }
        for (let i = 0; i < this._right.length; i++) {
            let term1 = this._right[i];
            let term2 = eq.getRight()[i];
            if (!term1.equals(term2)) {
                return false;
            }
        }
        return true;
    },

    addLeftTerm(term) {
        if (!term instanceof Term) {
            throw 'Equation.addLeftTerm error: wrong term type.';
        }
        this._left.push(term);
        this._left = this._left.sort(this.sortTerms);
    },

    addRightTerm(term) {
        if (!term instanceof Term) {
            throw 'Equation.addRightTerm error: wrong term type.';
        }
        this._right.push(term);
    },

    sortTerms(t1, t2) {
        if (t1.isVariable() && !t2.isVariable()) {
            return 1;
        }
        if (!t1.isVariable() && t2.isVariable()) {
            return -1;
        }

        if (t1.isVariable() && t2.isVariable()) {
            let t1Exp = t1.getMaxVariableExp();
            let t2Exp = t2.getMaxVariableExp();
            if (t1Exp < t2Exp) {
                return 1;
            }
            if (t1Exp > t2Exp) {
                return -1;
            }

            let t1Name = t1.getOrderedVariableNames();
            let t2Name = t2.getOrderedVariableNames();
            if (t1Name > t2Name) {
                return 1;
            }
            if (t1Name < t2Name) {
                return -1;
            }
        } else {
            return t1.getMaxValueRoot() >= t2.getMaxValueRoot() &&
                t1.getMaxValueExp() >= t2.getMaxValueExp();
        }
    },

    getCount() {
        return this._count;
    },

    setCount(count) {
        this._count = count;
        return this;
    },

    toString() {
        let str = '</br>';

        str += '<b>' + this._count + '</b>. ';

        if (this._left.length === 0) {
            str += '0';
        }
        if (this._left.length === 1 && this._left[0].is0()) {
            str += '0';
        }
        for (let i = 0; i < this._left.length; i++) {
            str += this._left[i].toString();
            if (i != this._left.length - 1 && this._left[i + 1].isPositive()) {
                str += ' + ';
            } else {
                str += ' ';
            }
        }
        str += ' = ';
        if (this._right.length === 0) {
            str += '0';
        }
        if (this._right.length === 1 && this._right[0].is0()) {
            str += '0';
        }
        for (let i = 0; i < this._right.length; i++) {
            str += this._right[i].toString();
            if (i != this._right.length - 1 && this._right[i + 1].isPositive()) {
                str += ' + ';
            } else {
                str += ' ';
            }
        }

        if (this._answer) {
            return `<span style='color:red'>${str}</span>`;
        }
        return str;
    }
}

export default Equation;