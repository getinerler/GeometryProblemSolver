'use strict';

function TermSum() {
    this.elements = [];
}

TermSum.prototype = {

    add(element) {
        this.elements.push(element);
    },

    toString() {
        return `(${this.elements.join(' + ')})`;
    }
}

export default TermSum;
