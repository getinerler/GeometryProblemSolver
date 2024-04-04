'use strict';

let trialLimit = 1000;

import Term from '../../models/equations/term.js';
import Value from '../../models/equations/value.js';
import Equation from '../../models/equations/equation.js';
import Creations from '../../modules/equations/creations.js'

function Calculator(equations, searched, angleNames, variables) {
    this.equations = equations;
    this.variables = variables;
    this.searched = searched;
    this.angleNames = angleNames;
    this.founds = [];
    this.changed = true;
}

Calculator.prototype = {

    solve() {
        let counter = 0;
        let searched = this.searched;
        if (this.equations.length === 0) {
            return {
                'solved': false,
                'equations': [],
                'message': 'No equation.'
            };
        }

        let val = null;
        while (this.changed &&
            this.equations.length < trialLimit &&
            counter++ < trialLimit) {
            this.changed = false;
            val = this.founds.find((x) => searched.indexOf(x.name) > -1);
            if (val) {
                break;
            }

            for (let equation of this.equations) {
                this.singleEquationCheck(equation);
            }
            val = this.founds.find((x) => searched.indexOf(x.name) > -1);
            if (val) {
                break;
            }

            let length = this.equations.length;
            for (let i = 1; i < length; i++) {
                this.compareTwoEquations(this.equations[i], this.equations[i - 1]);
            }

            val = this.founds.find((x) => searched.indexOf(x.name) > -1);
            if (val) {
                break;
            }
            if (counter > trialLimit) {
                return {
                    'solved': false,
                    'equations': this.equations,
                    'message': `Problem solve more than ${trialLimit} trials.`
                }
            }
        }
        if (val) {
            let response = {
                'solved': true,
                'name': searched,
                'value': val.value,
                'equations': this.equations,
                'message': null
            }
            return response;
        }
        return {
            'solved': false,
            'equations': this.equations,
            'message': `Failed to solve after ${trialLimit} attempt.`
        };
    },

    singleEquationCheck(eq) {
        let olderCreated = this.equations
            .find((eq) => eq.getAncestorIds().indexOf(eq.getCount()) > -1);
        if (olderCreated) {
            return;
        }
        if (eq.getLeft().length === 0) {
            return;
        }

        let parsed = this.parseEquation(eq);
        if (parsed.unknownVariableCount == 0) {
            return;
        }
        if (parsed.leftValuesWithExpCount > 0 || parsed.rightValuesWithExpCount) {
            this.simplifyValueExp(eq);
        } else if (parsed.rightVariablesCount > 0) {
            this.passRightVariablesToLeft(eq);
        } else if (parsed.leftValueCount > 0) {
            this.simplifyLeft(eq, parsed);
        } else if (parsed.someKnownLeftVarsCount > 0) {
            this.simplifyKnownValues(eq, parsed);
        } else if (parsed.unknownVariableCount === 1) {
            let unknown = parsed.unknownLeftVariables[0];
            if (unknown.getVariables().length > 1) {
                this.simplifyTermVariable(eq, parsed, unknown);
            } else if (unknown.getValues().length > 0) {
                this.simplifyCoefficients(eq, parsed, unknown);
            } else {
                let var1 = unknown.getVariables()[0];
                if (var1.getExponent() !== 1 || var1.getRoot() !== 1) {
                    this.simplifyExponent(eq, parsed, unknown);
                } else {
                    this.findVariable(eq, parsed, unknown);
                }
            }
        }
    },

    compareTwoEquations(eq1, eq2) {
        let olderCreated = this.equations
            .find(function (eq) {
                return eq.getAncestorIds().indexOf(eq1.getCount()) > -1 &&
                    eq.getAncestorIds().indexOf(eq2.getCount()) > -1;
            });

        if (olderCreated) {
            return;
        }

        let eq1LeftVars = eq1.getLeft().filter((val) => val.isVariable());
        let eq2LeftVars = eq2.getLeft().filter((val) => val.isVariable());
        let eq1RightVars = eq1.getRight().filter((val) => val.isVariable());
        let eq2RightVars = eq2.getRight().filter((val) => val.isVariable());

        if (eq1LeftVars.length +
            eq2LeftVars.length +
            eq1RightVars.length +
            eq2RightVars.length <= 2) {
            return;
        }
        if (eq1LeftVars.length !== eq2LeftVars.length) {
            return;
        }
        if (eq1RightVars.length !== eq2RightVars.length) {
            return;
        }
        for (let i = 0; i < eq1LeftVars.length; i++) {
            let e1 = eq1LeftVars[i];
            let e2 = eq2LeftVars[i];
            if (!e1.variablesEqual(e2)) {
                return;
            }
        }
        for (let i = 0; i < eq1RightVars.length; i++) {
            let e1 = eq1RightVars[i];
            let e2 = eq2RightVars[i];
            if (!e1.variablesEqual(e2)) {
                return;
            }
        }

        let var1 = eq1LeftVars[0];
        let var2 = eq2LeftVars[0];
        let gcd = var1.getGcd(var2);
        let remainder1 = var1.divide(gcd);
        let remainder2 = var2.divide(gcd);
        let firstMultiplied = eq1.multiplyTerm(remainder2);

        let secondMultiplied = eq2.multiplyTerm(remainder1);
        let newEq = firstMultiplied.subtract(secondMultiplied);
        newEq.setCreation(Creations.Subtraction);
        newEq.setAncestors([eq1, eq2]);
        newEq.setAncestorIds([eq1.getCount(), eq2.getCount()]);

        if (newEq.getLeft().length === 0 && newEq.getRight().length === 0) {
            return;
        }
        this.addEquation(newEq);
    },

    simplifyValueExp(eq) {
        let newEq = new Equation();
        newEq.setCreation(Creations.ValueExponentsSimplified);
        newEq.setAncestors([eq]);
        newEq.setAncestorIds([eq.getCount()]);
        for (let term of eq.getLeft()) {
            newEq.addLeftTerm(this.simplifyValueExponents(term));
        }
        for (let term of eq.getRight()) {
            newEq.addRightTerm(this.simplifyValueExponents(term));
        }
        this.addEquation(newEq);
    },

    passRightVariablesToLeft(eq) {
        let newEq = new Equation();
        newEq.setCreation(Creations.LeftAndRightElementsFixed);
        newEq.setAncestors([eq]);
        newEq.setAncestorIds([eq.getCount()]);

        let right = null;

        for (let term of eq.getLeft()) {
            if (term.isNaturalNumber()) {
                if (right === null) {
                    right = term.copy().multiply(new Term(-1));
                } else {
                    right = right.add(term.copy().multiply(new Term(-1)));
                }
            } else if (term.isValue() || term.isVariable()) {
                newEq.addLeftTerm(term.copy());
            }
        }

        for (let term of eq.getRight()) {
            if (term.isNaturalNumber()) {
                if (right === null) {
                    right = term.copy();
                } else {
                    right = right.add(term.copy());
                }
            } else if (term.isValue()) {
                newEq.addRightTerm(term.copy());
            } else if (term.isVariable()) {
                newEq.addLeftTerm(term.copy().multiply(new Term(-1)));
            }
        }

        if (right) {
            newEq.addRightTerm(right);
        }

        this.addEquation(this.checkNegatives(newEq));
    },

    simplifyLeft(eq, parsed) {
        let sum = parsed.leftValues.reduce((acc, val) => acc.add(val), new Term());
        let term = this.getSideRemains(parsed.rightValues) || new Term(0);
        let newEqRight = term.subtract(sum);

        let newEq = new Equation();
        newEq.setCreation(Creations.LeftValuesSimplified);
        newEq.setAncestors([eq]);
        newEq.setAncestorIds([parsed.count]);
        newEq.addRightTerm(newEqRight);

        for (let element of eq.getLeft()) {
            if (element.isVariable() && !element.is0()) {
                newEq.addLeftTerm(element.copy());
            }
        }
        if (newEq.getLeft().length === 0) {
            return;
        }
        this.addEquation(this.checkNegatives(newEq));
    },

    simplifyTermVariable(eq, parsed, unknown) {
        if (!unknown.getVariables().some((x) => x.isKnown())) {
            return;
        }

        let newEq = new Equation();
        newEq.addRightTerm(this.getSideRemains(parsed.rightValues).copy());
        newEq.setAncestors([eq]);
        newEq.setAncestorIds([parsed.count]);
        newEq.setCreation(Creations.VariableSimplified);

        let newTerm = new Term();
        for (let val of unknown.getValues()) {
            newTerm.addValue(val.copy());
        }
        for (let var1 of unknown.getVariables()) {
            if (var1.isKnown()) {
                newEq._right[0] = newEq._right[0].divide(var1.calculate());
            } else {
                newTerm.addVariable(var1.copy());
            }
        }

        newEq.addLeftTerm(newTerm);
        this.addEquation(newEq);
    },

    simplifyCoefficients(eq, parsed) {
        let newEq = new Equation()
            .setAncestors([eq])
            .setAncestorIds([parsed.count])
            .setCreation(Creations.CoefficientsSimplified);

        let oldVariableTerm = eq.getLeft()[0];
        let newTerm = eq.getRight()[0].copy();
        for (let value of oldVariableTerm.getValues()) {
            newTerm = newTerm.divide(new Term(value));
        }

        newEq.addLeftTerm(new Term(null, oldVariableTerm.getVariables()[0].copy()));
        newEq.addRightTerm(newTerm);

        this.addEquation(newEq);
    },

    simplifyExponent(eq, parsed, unknown) {
        let unknownVariable = unknown.getVariables()[0];
        if (unknownVariable.getExponent() < 1) {
            let newEq = new Equation()
                .setCreation(Creations.VariableMovedToTop)
                .setAncestors([eq])
                .setAncestorIds([parsed.count]);
            for (let el of eq.getLeft()) {
                newEq.addLeftTerm(el.reverse());
            }
            for (let el of eq.getRight()) {
                newEq.addRightTerm(el.reverse());
            }
            this.addEquation(newEq);
            this.changed = true;
        } else if (unknown.getValues().length === 0) {
            let newRightValue = this.getSideRemains(parsed.rightValues)
                .exp(unknownVariable.getRoot())
                .root(unknownVariable.getExponent());
            let newEq = new Equation()
                .setCreation(Creations.ExponentiatonRemoved)
                .setAncestors([eq])
                .setAncestorIds([parsed.count])
                .addLeftTerm(new Term(null, unknownVariable.getVariable()))
                .addRightTerm(newRightValue);
            this.addEquation(newEq);
            this.changed = true;
        } else {
            let newEq = new Equation()
                .setCreation(Creations.CoefficientRemoved)
                .setAncestors([eq])
                .setAncestorIds([parsed.count]);
            for (let val of unknown.getValues()) {
                newEq.addRightTerm(this.getSideRemains(parsed.rightValues).divide(new Term(val)));
            }
            newEq.addLeftTerm(new Term(null, unknownVariable.copy()));
            this.addEquation(newEq);
            this.changed = true;
        }
    },

    simplifyKnownValues(eq, parsed) {
        let newRight = this.getSideRemains(eq.getRight());
        let newLeftTerms = [];

        for (let term of eq.getLeft()) {
            if (term.isValue()) {
                newLeftTerms.push(term.copy());
            } else if (term.isVariable()) {
                let newTerm = new Term(term.getValues());
                for (let var1 of term.getVariables()) {
                    if (var1.isKnown()) {
                        newTerm = newTerm.multiply(var1.calculate());
                    } else {
                        newTerm.addVariable(var1);
                    }
                }
                newLeftTerms.push(newTerm);
            }
        }

        let names = parsed.someKnownLeftVariables
            .reduce((acc, x) => acc.concat(x.getVariables()), [])
            .map((x) => x.getName());
        let founds = this.founds.filter((x) => names.indexOf(x.name) > -1);
        let foundEquations = founds.map((x) => x.equation);

        let newEq = new Equation();
        newEq.setCreation(Creations.KnownValuesSimplified);
        newEq.setAncestors(foundEquations.concat([eq]));
        newEq.setAncestorIds(foundEquations.map((x) => x.getCount()).concat([parsed.count]));
        if (newRight) {
            newEq.addRightTerm(newRight);
        }
        for (let el of newLeftTerms) {
            newEq.addLeftTerm(el);
        }
        this.addEquation(newEq);
    },

    findVariable(eq, parsed, unknownEl) {
        let unknown = unknownEl.getVariables()[0];
        let newValue = parsed.rightValues[0]
            .divide(new Term(unknownEl.getValues()))
            .root(unknown.getExponent());
        unknown.setValue(newValue.getValues());
        this.founds.push({
            'name': unknown.getName(),
            'value': newValue.getValues(),
            'equation': eq
        });
        for (let angName of this.angleNames) {
            if (angName.indexOf(unknown.getName()) > -1) {
                for (let var1 of this.variables) {
                    if (var1.getName() === unknown.getName()) {
                        var1.setValue(newValue.getValues());
                    }
                }
            }
        }
        if (this.searched.indexOf(unknown.getName()) > -1) {
            eq.setAnswer(true);
        }
        this.changed = true;
    },

    checkNegatives(eq) {
        let leftPositive = eq.getLeft().find((x) => x.isPositive());
        let rightPositive = eq.getRight().find((x) => x.isPositive());
        if (!leftPositive && !rightPositive) {
            let newEq = new Equation();
            newEq.setCreation(eq.getCreation());
            newEq.setAncestors(eq.getAncestors());
            newEq.setAncestorIds(eq.getAncestorIds());
            for (let left of eq.getLeft()) {
                newEq.addLeftTerm(left.multiply(new Term(-1)));
            }
            for (let right of eq.getRight()) {
                newEq.addRightTerm(right.multiply(new Term(-1)));
            }
            return newEq;
        }
        return eq;
    },

    simplifyValueExponents(term) {
        let newTerm = new Term();
        for (let var1 of term.getVariables()) {
            newTerm.addVariable(var1.copy());
        }
        for (let val of term.getValues()) {
            if (val.getRoot() === 1 && val.getExponent() > 1) {
                newTerm.addValue(new Value(Math.pow(val.getNumber(), val.getExponent())));
            } else {
                newTerm.addValue(val.copy());
            }
        }
        return newTerm;
    },

    getSideRemains(elements) {
        if (elements && elements.length > 0) {
            return elements[0];
        }
        return null;
    },

    addEquation(eq) {
        for (let eqOld of this.equations) {
            if (eq.equals(eqOld)) {
                return;
            }
        }
        this.equations.push(eq);
        this.changed = true;
    },

    parseEquation(eq) {
        let knownLeftVars = eq.getLeft().filter((x) => x.isVariable() && x.isKnown());
        let someKnownLeftVars = eq.getLeft().filter((x) => x.isVariable() && x.isSomeKnown());
        let knownRightVars = eq.getRight().filter((x) => x.isVariable() && x.isKnown());
        let unknownLeftVars = eq.getLeft().filter((x) => x.isVariable() && !x.isKnown());
        let unknownRightVars = eq.getRight().filter((x) => x.isVariable() && !x.isKnown());

        let leftValues = eq.getLeft().filter((x) => x.isValue());
        let rightValues = eq.getRight().filter((x) => x.isValue());

        let leftValuesWithExp = leftValues.filter(function (x) {
            for (let val of x.getValues()) {
                if (val.getRoot() === 1 && val.getExponent() > 1) {
                    return true;
                }
            }
            return false;
        });
        let rightValuesWithExp = rightValues.filter(function (x) {
            for (let val of x.getValues()) {
                if (val.getRoot() === 1 && val.getExponent() > 1) {
                    return true;
                }
            }
            return false;
        });

        let variableCount = knownLeftVars.length + unknownLeftVars.length;
        let unknownVariableCount = unknownLeftVars.length + unknownRightVars.length;
        let knownVariableCount = knownLeftVars.length;
        let someKnownLeftVarsCount = someKnownLeftVars.length;
        let leftValueCount = leftValues.length;
        let rightVariablesCount = unknownRightVars.length + knownRightVars.length;
        let leftValuesWithExpCount = leftValuesWithExp.length;
        let rightValuesWithExpCount = rightValuesWithExp.length;

        return {
            count: eq.getCount(),
            knownLeftVariables: knownLeftVars,
            someKnownLeftVariables: someKnownLeftVars,
            knownRightVariables: knownRightVars,
            knownVariableCount,
            someKnownLeftVarsCount,
            leftValues,
            leftValueCount,
            leftValuesWithExpCount,
            rightValues,
            rightVariablesCount,
            rightValuesWithExpCount,
            variableCount,
            unknownLeftVariables: unknownLeftVars,
            unknownRightVariables: unknownRightVars,
            unknownVariableCount
        };
    }
}

export default Calculator;