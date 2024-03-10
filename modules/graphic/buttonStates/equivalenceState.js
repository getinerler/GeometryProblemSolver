'use strict';

import Equivalence from '../../../models/graphic/equivalence.js';
import AngleSum from '../../../models/solve/angleSum.js';

function EquivalenceState(elements) {
    this._elements = elements;
    this._equivalentTemp = null;
    this._acceptedTypes = ['Angle, Line'];
    this._currentEquivalent = null;
}

EquivalenceState.prototype = {

    mouseDownEvent() {
        if (!this._elements.hoveredObject) {
            return;
        }

        let hovered = this._elements.hoveredObject.obj;
        if (!this._acceptedTypes.indexOf(hovered.getType()) === -1) {
            return;
        }

        let fixedObj = this.fixObject(hovered);

        if (!this._currentEquivalent) {
            this._currentEquivalent = this.findEquivalentFromObject(fixedObj);
            if (!this._currentEquivalent) {
                let newEq = new Equivalence()
                    .add(fixedObj)
                    .setType(fixedObj.getType());
                this._elements.equivalents.push(newEq);
                this._currentEquivalent = newEq;
            } else {
                this.addToEquivalent(fixedObj);
            }
        } else {
            this.addToEquivalent(fixedObj);
        }
    },

    mouseMoveEvent() {

    },

    mouseUpEvent() {

    },

    addToEquivalent(obj) {
        if (this._currentEquivalent.contains(obj)) {
            this._currentEquivalent.remove(obj);
        } else {
            this._currentEquivalent.add(obj);
        }
    },

    findEquivalentFromObject(obj) {
        for (let equi of this._elements.equivalents) {
            if (equi.getType() === obj.getType()) {
                return equi;
            }
        }
        return null;
    },

    fixObject(obj) {
        if (obj.getType() === 'Angle') {
            return new AngleSum(obj);
        } else if (obj.getType() === "Line") {
            return new LineSum(obj);
        }
        return obj;
    }
}

export default EquivalenceState;