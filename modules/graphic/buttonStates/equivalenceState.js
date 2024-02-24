'use strict';

import Equivalence from '../../../models/graphic/equivalence.js';

function EquivalenceState(elements, equivalents) {
    this._elements = elements;
    this._equivalents = equivalents;
    this._equivalentTemp = null;
}

EquivalenceState.prototype = {

    mouseDownEvent() {
        if (!this._elements.hoveredObject) {
            return;
        }
        let hovered = this._elements.hoveredObject.obj;
        if (hovered.getType() === "Dot") {
            return;
        }
        let found = false;
        for (let equi of this._equivalents) {
            if (equi.getType() === hovered.getType()) {
                found = true;
                if (equi.contains(hovered)) {
                    equi.remove(hovered);
                } else {
                    equi.add(hovered);
                }
            }
        }
        if (!found) {
            let newEq = new Equivalence();
            newEq.add(hovered);
            newEq.setType(hovered.getType());
            this._equivalents.push(newEq);
        }
    },

    mouseMoveEvent() {

    },

    mouseUpEvent() {

    }
}

export default EquivalenceState;