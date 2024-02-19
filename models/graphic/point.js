'use strict';

import Dot from '../graphic/dot.js';

function Point(x, y) {
    this._x = x || 0;
    this._y = y || 0;
    this._name = null;
    this._intersectLines = [];
}

Point.prototype = {

    getName() {
        return this._name;
    },

    setName(name) {
        this._name = name;
        return this;
    },

    getX() {
        return this._x;
    },

    getY() {
        return this._y;
    },

    setX(x) {
        this._x = x;
        return this;
    },

    setY(y) {
        this._y = y;
        return this;
    },

    getIntersectionLines() {
        return this._intersectLines;
    },

    setIntersectionLines(lines) {
        this._intersectLines = lines;
        return this;
    },

    addIntersectionLine(line) {
        this._intersectLines.push(line);
        return this;
    },

    isIntersectionLine(line) {
        return this._intersectLines.indexOf(line) > -1;
    },

    update(x, y) {
        this._x = x;
        this._y = y;
    },

    copy() {
        return new Point(this._x, this._y);
    },

    same(point) {
        return point.getX() === this._x && point.getY() === this._y;
    },

    createDot() {
        let newDot = new Dot(this._x, this._y);
        newDot.setIntersectionLines(this._intersectLines);
        return newDot;
    },

    toString() {
        return `(${this._x}, ${this._y})`;
    }
}

export default Point;