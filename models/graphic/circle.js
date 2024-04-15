'use strict';

function Circle(dot, radius) {
    this._dot = dot || null;
    this._radius = radius || 0;
    this._diameter = radius ? radius * 2 : 0;
    this._hovered = false;
    this._selected = false;
}

Circle.prototype = {

    getType() {
        return 'Circle';
    },

    getDot() {
        return this._dot;
    },

    getX() {
        return this._dot.getX();
    },

    getY() {
        return this._dot.getY();
    },

    getRadius() {
        return this._radius;
    },

    isHovered() {
        return this._hovered;
    },

    setHovered(hovered) {
        this._hovered = hovered;
        return this;
    },

    isSelected() {
        return this._selected;
    },

    setSelected(selected) {
        this._selected = selected;
        return this;
    },

    setSelected(selected) {
        this._selected = selected;
        return this;
    },

    toString() {
        return this._dot.getName();
    }
}

export default Circle;