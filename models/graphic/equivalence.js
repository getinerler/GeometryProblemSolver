'use strict';

function Equivalence(elements) {
    this._elements = [];
    this._type = null;

    if (elements) {
        for (let el of elements) {
            this.add(el);
        }
    }
}

Equivalence.prototype = {

    getType() {
        return this._type;
    },

    setType(type) {
        this._type = type;
        return this;
    },

    get(i) {
        return this._elements[i];
    },

    getElements() {
        return this._elements;
    },

    add(element) {
        if (this._elements.length === 0) {
            this._elements.push(element);
            this._type = element.getType();
        } else {
            if (this._type !== element.getType()) {
                throw 'Equivalence.add: Wrong type.';
            } else if (this._elements.indexOf(element) === -1) {
                this._elements.push(element);
            }
        }
        return this;
    },

    remove(element) {
        if (element.getType() === 'AngleSum') {
            for (let el of this._elements) {
                if (el.getType() !== 'AngleSum') {
                    continue;
                }
                if (element.equals(el)) {
                    this._elements = this._elements.filter((x) => x !== el);
                }
            }
        } else if (element.getType() === 'LineSum') {
            for (let el of this._elements) {
                if (el.getType() !== 'LineSum') {
                    continue;
                }
                if (element.equals(el)) {
                    this._elements = this._elements.filter((x) => x !== el);
                }
            }
        } else {
            this._elements = this._elements.filter((x) => x !== element);
        }
    },

    contains(element) {
        for (let el of this._elements) {
            if (element.getType() === 'AngleSum') {
                if (el.getType() !== 'AngleSum') {
                    continue;
                }
                if (element.isEquivalent(el)) {
                    return true;
                }
            } else if (element.getType() === 'LineSum') {
                if (el.getType() !== 'LineSum') {
                    continue;
                }
                if (element.isEquivalent(el)) {
                    return true;
                }
            } else {
                if (element === el || element.getValue() && element.equals(el)) {
                    return true;
                }
            }

        }
        return false;
    },

    containsList(list) {
        for (let el of list) {
            if (this.contains(el)) {
                return true;
            }
        }
        return false;
    },

    toString() {
        return this._elements.map((x) => x.getValueName()).join(' = ');
    }
}

export default Equivalence;