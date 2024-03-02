'use strict';

function Triangle(dots, lines, angles) {
    this._dots = dots;
    this._lines = lines;
    this._angles = angles;
}

Triangle.prototype = {

    getDots() {
        return this._dots;
    },

    getLines() {
        return this._lines;
    },

    getLine(i) {
        return this._lines[i];
    },

    getAngles() {
        return this._angles;
    },

    getAngle(i) {
        return this._angles[i];
    },

    getOtherLine(line1, line2) {
        return this._lines.find((x) => x !== line1 && x !== line2);
    },

    getAngleLine(angle) {
        for (let line of this._lines) {
            if (angle.getLine1() !== line && angle.getLine2() !== line) {
                return line;
            }
        }
        throw 'Angle doesn\'t belong to triangle.';
    },

    getLineAngle(line1, line2) {
        for (let angle of this._angles) {
            if (angle.getLine1() === line1 && angle.getLine2() === line2) {
                return angle;
            }
            if (angle.getLine2() === line2 && angle.getLine1() === line2) {
                return angle;
            }
        }
        return null;
    },

    getName() {
        return this.toString();
    },

    toString() {
        return "△" + this._dots.map((x) => x.getName()).sort().join('');
    }
}

export default Triangle;