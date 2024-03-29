'use strict';

function Angle(dot, line1, line2) {
    this._dot = null;
    this._line1 = null;
    this._line2 = null;
    this._children = [];

    if (dot) {
        this._dot = dot;
    }
    if (line1) {
        this._line1 = line1;
    }
    if (dot) {
        this._line2 = line2;
    }

    this._value = null;
    this._hovered = false;
    this._selected = false;
    this._canvasAngle = 0;
    this._line1Angle = 0;
    this._line2Angle = 0;
}

Angle.prototype = {

    getType() {
        return 'Angle';
    },

    getName() {
        return 'm(' +
            this._line1.getOtherDot(this._dot).getName() +
            this._dot.getName() +
            this._line2.getOtherDot(this._dot).getName() +
            ')';
    },

    getValueName() {
        return this.getName();
    },

    getDot() {
        return this._dot;
    },

    setDot(dot) {
        this._dot = dot;
        return this;
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

    getLine1() {
        return this._line1;
    },

    setLine1(line) {
        this._line1 = line;
        return this;
    },

    getLine2() {
        return this._line2;
    },

    setLine2(line) {
        this._line2 = line;
        return this;
    },

    getCanvasAngle() {
        return this._canvasAngle;
    },

    setCanvasAngle(ang) {
        this._canvasAngle = ang;
        return this;
    },

    getLine1Angle() {
        return this._line1Angle;
    },

    setLine1Angle(ang) {
        this._line1Angle = ang;
        return this;
    },

    getLine2Angle() {
        return this._line2Angle;
    },

    setLine2Angle(ang) {
        this._line2Angle = ang;
        return this;
    },

    isLine(line) {
        return this._line1 === line || this._line2 === line;
    },

    addChild(child) {
        this._children.push(child);
        return this;
    },

    removeChild(child) {
        this._children = this._children.filter((x) => x !== child);
        return this;
    },

    getChildren() {
        return this._children;
    },

    getValue() {
        return this._value;
    },

    getValueString() {
        return `${this._value}°`;
    },

    setValue(value) {
        if (value === '?') {
            this._value = value;
        } else {
            this._value = Number(value);
        }
        return this;
    },

    isKnown() {
        if (this._value === '?') {
            return false;
        }
        if (!this._value) {
            return false;
        }
        return true;
    },

    equals(ang) {
        return ang === this;
    },

    toString() {
        return this.getName();
    }
}

export default Angle;