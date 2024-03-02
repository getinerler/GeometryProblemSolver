'use strict';

function Similarity(model) {
    this._triangle1 = model && model.triangle1 ? model.triangle1 : null;
    this._triangle2 = model && model.triangle2 ? model.triangle2 : null;
    this._dots1 = model && model.dots1 ? model.dots1 : [];
    this._dots2 = model && model.dots2 ? model.dots2 : [];
    this._lines1 = model && model.lines1 ? model.lines1 : [];
    this._lines2 = model && model.lines2 ? model.lines2 : [];
    this._angles1 = model && model.angles1 ? model.angles1 : [];
    this._angles2 = model && model.angles2 ? model.angles2 : [];
}

Similarity.prototype = {

    getDots1() {
        return this._dots1;
    },

    getDots2() {
        return this._dots2;
    },

    getLines1() {
        return this._lines1;
    },

    getLines2() {
        return this._lines2;
    },

    getAngles1() {
        return this._angles1;
    },

    getAngles2() {
        return this._angles2;
    },

    has(tri) {
        return this._triangle1 === tri || this._triangle2 === tri;
    },

    toString() {
        return this._triangle1.getName() + ' ~ ' + this._triangle2.getName();
    }
}

export default Similarity;