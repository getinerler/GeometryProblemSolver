'use strict';

function Variable(name, value) {
    this._name = name;
    this._value = value || null;
}

Variable.prototype = {

    isKnown() {
        return this._value !== null;
    },

    getName() {
        return this._name;
    },

    setName(name) {
        this._name = name;
        return this;
    },

    getValue() {
        return this._value;
    },

    setValue(value) {
        this._value = value;
        return this;
    }
}

export default Variable;