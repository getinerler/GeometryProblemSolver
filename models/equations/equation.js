'use strict';

import Term from '../../models/equations/term.js';
import Creations from '../../modules/equations/creations.js';

window.equationCounter = 1;

function Equation() {
    this._creation = null;
    this._creationText = null;
    this._ancestors = [];
    this._ancestorIds = [];
    this._count = window.equationCounter++;
    this._left = [];
    this._right = [];
    this._answer = false;
}

Equation.prototype = {

    subtract(eq) {
        let newEq = new Equation();
        newEq.setCreation(Creations.Subtraction);
        newEq.setAncestors(this, eq);
        newEq.setAncestorIds([this.getCount(), eq.getCount()]);

        for (let term1 of this._left) {
            let term2;
            if (term1.isVariable()) {
                term2 = eq.getLeft().find((x) => x.isVariable() && x.variablesEqual(term1));
            } else if (term1.isValue()) {
                term2 = eq.getLeft().find((x) => x.isValue() && x.sameDegrees(term1));
            }
            if (term2) {
                let newTerm = term1.subtract(term2);
                if (!newTerm.is0()) {
                    newEq.addLeftTerm(newTerm);
                }
            } else {
                newEq.addLeftTerm(term1.copy());
            }
        }

        for (let term1 of eq.getLeft()) {
            if (term1.isVariable()) {
                let term2 = this._left.find((x) => x.isVariable() && x.variablesEqual(term1));
                if (!term2) {
                    newEq.addLeftTerm(term1.multiply(new Term(-1)));
                }
            } else if (term1.isValue()) {
                let term2 = this._left.find((x) => x.isValue() && x.sameDegrees(term1));
                if (!term2) {
                    newEq.addLeftTerm(term1.multiply(new Term(-1)));
                }
            }
        }

        for (let term1 of this._right) {
            let term2;
            if (term1.isVariable()) {
                term2 = eq.getRight().find((x) => x.isVariable() && x.variablesEqual(term1));
            } else if (term1.isValue()) {
                term2 = eq.getRight().find((x) => x.isValue() && x.sameDegrees(term1));
            }
            if (term2) {
                let newTerm = term1.subtract(term2);
                if (!newTerm.is0()) {
                    newEq.addRightTerm(newTerm);
                }
            } else {
                newEq.addRightTerm(term1.copy());
            }
        }

        for (let term1 of eq.getRight()) {
            if (term1.isVariable()) {
                let term2 = this._right.find((x) => x.isVariable() && x.variablesEqual(term1));
                if (!term2) {
                    newEq.addRightTerm(term1.multiply(new Term(-1)));
                }
            } else if (term1.isValue()) {
                let term2 = this._right.find((x) => x.isValue() && x.sameDegrees(term1));
                if (!term2) {
                    newEq.addRightTerm(term1.multiply(new Term(-1)));
                }
            }
        }

        return newEq;
    },

    multiplyTerm(term) {
        let newEquation = new Equation();
        newEquation.setCreation(Creations.TermMultiplied);
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

    setCreation(creation, skipText) {
        this._creation = creation;
        if (!skipText) {
            this._creationText = this._creation.getExplanation();
        }
        return this;
    },

    getCreationText() {
        return this._creationText;
    },

    setCreationText(text) {
        return this._creationText = text;
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

    addLeftTerms(terms) {
        for (let term of terms) {
            this.addLeftTerm(term);
        }
    },

    addLeftTerm(term) {
        if (!term instanceof Term) {
            throw 'Equation.addLeftTerm error: wrong term type.';
        }
        this._left.push(term);
        this._left = this._left.sort(this.sortTerms);
    },

    addRightTerms(terms) {
        for (let term of terms) {
            this.addRightTerm(term);
        }
    },

    addRightTerm(term) {
        if (!term instanceof Term) {
            throw 'Equation.addRightTerm error: wrong term type.';
        }
        this._right.push(term);
    },

    removeLeftTerm(term) {
        this._left = this._left.filter((x) => x !== term);
        this._left = this._left.sort(this.sortTerms);
    },

    removeRightTerm(term) {
        this._right = this._right.filter((x) => x !== term);
        this._right = this._right.sort(this.sortTerms);
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
        let str = '';

        if (this._left.length === 0) {
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
        if (this._answer) {
            str += "<b>";
        }
        if (this._right.length === 0) {
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
            str += "</b>";
        }
        return str;
    }
}

export default Equation;