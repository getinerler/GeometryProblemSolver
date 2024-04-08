'use strict';

import { getDotName } from '../../modules/graphic/names.js';

function Dot(x, y, name) {
    this._x = x || 0;
    this._y = y || 0;
    this._name = name || getDotName();
    this._hovered = false;
    this._selected = false;
    this._intersectionLines = [];
    this._baseLine = null;
    this._lineRatio = null;
}

Dot.prototype = {

    getType() {
        return 'Dot';
    },

    getX() {
        return this._x;
    },

    getY() {
        return this._y;
    },

    getName() {
        return this._name;
    },

    getValueName() {
        return this.getName();
    },

    setX(x) {
        this._x = x;
        return this;
    },

    setY(y) {
        this._y = y;
        return this;
    },

    update(x, y) {
        this._x = x;
        this._y = y;
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

    setSelected(selected) {
        this._selected = selected;
        return this;
    },

    getIntersectionLines() {
        return this._intersectionLines;
    },

    setIntersectionLines(lines) {
        this._intersectionLines = lines;
        return this;
    },

    addIntersectionLine(line) {
        if (this._intersectionLines.indexOf(line) === -1) {
            this._intersectionLines.push(line);
        }
        return this;
    },

    isIntersectionLine(line) {
        return this._intersectionLines.indexOf(line) > -1;
    },

    removeIntersection(line) {
        this._intersectionLines = this._intersectionLines.filter((x) => x !== line);
    },

    isIntersectionDot() {
        return this._intersectionLines.length > 0;
    },

    replaceIntersectionLine(line, line2) {
        let index = this._intersectionLines.indexOf(line);
        this._intersectionLines.splice(index, index, line2);
    },

    isOnLine() {
        return this._baseLine !== null;
    },

    isBaseLine(line) {
        return this._baseLine === line;
    },

    getBaseLine() {
        return this._baseLine;
    },

    setBaseLine(line) {
        this._baseLine = line;
        return this;
    },

    getLineRatio() {
        return this._lineRatio;
    },

    setLineRatio(ratio) {
        this._lineRatio = ratio;
        return this;
    },

    copy(name) {
        let newDot = new Dot(this._x, this._y, name ? name : getDotName())
            .setHovered(this._hovered)
            .setSelected(this._selected)
            .setIntersectionLines(this._intersectionLines)
            .setBaseLine(this._baseLine);
        return newDot;
    },

    toString() {
        return this.getName();
    }
}

export default Dot;