'use strict';

function Line(dot1, dot2, value) {
    this._dot1 = dot1 || null;
    this._dot2 = dot2 || null;
    this._value = value || null;
    this._valueGeneration = 0;
    this._hovered = false;
    this._selected = false;
    this._angle = 0;
    this._lineSegments = [];
    this._baseLine = null;
}

Line.prototype = {

    getType() {
        return 'Line';
    },

    getDot1() {
        return this._dot1;
    },

    setDot1(dot) {
        this._dot1 = dot;
        return this;
    },

    getDot2() {
        return this._dot2;
    },

    setDot2(dot) {
        this._dot2 = dot;
        return this;
    },

    getX1() {
        return this._dot1.getX();
    },

    getY1() {
        return this._dot1.getY();
    },

    getX2() {
        return this._dot2.getX();
    },

    getY2() {
        return this._dot2.getY();
    },

    getName() {
        return [this._dot1.getName(), this._dot2.getName()].sort().join('');
    },

    getValueName() {
        return `|${this.getName()}|`;
    },

    getValue() {
        return this._value;
    },

    isSegment() {
        return !!this._baseLine;
    },

    setValue(value) {
        if (value === '?') {
            this._value = value;
        } else {
            this._value = Number(value);
        }
        return this;
    },

    getValueGeneration() {
        return this._valueGeneration;
    },

    setValueGeneration(num) {
        this._valueGeneration = num;
    },

    getAngle() {
        return this._angle;
    },

    setAngle(angle) {
        this._angle = angle;
        return this;
    },

    getSegments() {
        return this._lineSegments;
    },

    addSegment(line) {
        this._lineSegments.push(line);
        return this;
    },

    removeSegment(seg) {
        this._lineSegments = this._lineSegments.filter((x) => x !== seg);
    },

    getBase() {
        return this._baseLine;
    },

    getBaseOrSelf() {
        if (this._baseLine) {
            return this._baseLine;
        }
        return this;
    },

    setBase(line) {
        this._baseLine = line;
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

    isKnown() {
        if (this._value === '?') {
            return false;
        }
        if (!this._value) {
            return false;
        }
        return true;
    },

    getOtherDot(dot) {
        return dot === this._dot1 ? this._dot2 : this._dot1;
    },

    isLineEnd(dot) {
        return this._dot1 === dot || this._dot2 === dot;
    },

    isConnected(line) {
        return this._dot1 === line.getDot1() ||
            this._dot1 === line.getDot2() ||
            this._dot2 === line.getDot1() ||
            this._dot2 === line.getDot2();
    },

    getConnectionDot(line) {
        if (this._dot1 === line.getDot1()) {
            return this._dot1;
        }
        if (this._dot1 === line.getDot2()) {
            return this._dot1;
        }
        if (this._dot2 === line.getDot1()) {
            return this._dot2;
        }
        if (this._dot2 === line.getDot2()) {
            return this._dot2;
        }
        return null;
    },

    copy() {

    },

    equals(line) {
        if (this._value === '?') {
            return false;
        }
        if (line._value === '?') {
            return false;
        }
        return this._value === line.getValue();
    },

    toString() {
        return this.getName();
    }
}

export default Line;