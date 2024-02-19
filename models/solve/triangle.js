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

    getAngles() {
        return this._angles;
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

    toString() {
        return this._lines.map((x) => x.getName()).join(',');
    }
}

export default Triangle;