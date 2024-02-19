'use strict';

function Rectangle(dots, lines, angles) {
    this._dots = dots;
    this._lines = lines;
    this._angles = angles;
}

Rectangle.prototype = {

    getDots() {
        return this._dots;
    },

    getLines() {
        return this._lines;
    },

    getAngles() {
        return this._angles;
    },

    getAngleLine(angle) {
        for (let line of this.lines) {
            if (angle.getLine1() !== line && angle.getLine2() !== line) {
                return line;
            }
        }
        throw 'Angle doesn\'t belong to rectangle.';
    },

    getLineAngle(line1, line2) {
        for (let angle of this.angles) {
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
        return this._dots.map((x) => x.toString()).join(', ');
    }
}

export default Rectangle;