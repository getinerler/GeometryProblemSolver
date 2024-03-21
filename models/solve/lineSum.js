'use strict';

import Line from '../../models/graphic/line.js';

function LineSum(lines) {
    this._lines = [];
    this._dot1 = null;
    this._dot2 = null;
    if (Array.isArray(lines)) {
        for (let line of lines) {
            this.addLine(line);
        }
    } else if (lines) {
        this.addLine(lines);
    }
}

LineSum.prototype = {

    getType() {
        return 'LineSum';
    },

    getLines() {
        return this._lines;
    },

    getLine(i) {
        return this._lines[i];
    },

    addLine(line) {
        if (!(line instanceof Line)) {
            throw 'LineSum.addLine: Wrong type: ' + line.getType();
        }
        this._lines.push(line);
        this.findStartAndEndDots();
    },

    getDot1() {
        return this._dot1;
    },

    getDot2() {
        return this._dot2;
    },

    getOtherDot(dot) {
        return dot === this._dot1 ? this._dot2 : this._dot1;
    },

    getValue() {
        let unknowns = this._lines.filter((x) => !x.isKnown());
        if (unknowns.length > 0) {
            return null;
        }
        return this._lines.reduce((acc, x) => acc + x.getValue(), 0);
    },

    isKnown() {
        for (let line of this._lines) {
            if (!line.isKnown()) {
                return false;
            }
        }
        return true;
    },

    valueEqual(val) {
        let unknowns = this._lines.filter((x) => !x.isKnown());
        if (unknowns.length > 0) {
            return false;
        }

        let sum = this._lines.reduce((acc, x) => acc + x.getValue(), 0);
        return val === sum;
    },

    contains(line) {
        return !!this._lines.find((x) => x === line);
    },

    getValueName() {
        return this._lines.map((x) => x.getValueName()).join(' + ');
    },

    findStartAndEndDots() {
        let dotList = [];
        for (let line of this._lines) {
            let oldDot1 = dotList.find((x) => x.dot === line.getDot1());
            if (oldDot1) {
                oldDot1.count++;
            } else {
                dotList.push({ 'dot': line.getDot1(), 'count': 1 });
            }

            let oldDot2 = dotList.find((x) => x.dot === line.getDot2());
            if (oldDot2) {
                oldDot2.count++;
            } else {
                dotList.push({ 'dot': line.getDot2(), 'count': 1 });
            }
        }
        let lineEnds = dotList.filter((x) => x.count === 1);
        this._dot1 = lineEnds[0].dot;
        this._dot2 = lineEnds[1].dot;
    },

    isEquivalent(lineSum) {
        let lines1 = this._lines;
        let lines2 = lineSum.getLines();
        let lines1Unknown = lines1.filter((x) => !x.isKnown());
        let lines2Unknown = lines2.filter((x) => !x.isKnown());
        let lines1Known = lines1.filter((x) => x.isKnown());
        let lines2Known = lines2.filter((x) => x.isKnown());

        if (lines1.length !== lines2.length) {
            if (lines1Unknown.length > 0) {
                return false;
            }
            if (lines2Unknown.length > 0) {
                return false;
            }
            let line1Sum = lines1.reduce((acc, x) => acc + x.getValue(), 0);
            let line2Sum = lines2.reduce((acc, x) => acc + x.getValue(), 0);
            return line1Sum === line2Sum;
        }

        if (lines1Known.length !== lines2Known.length) {
            return false;
        }
        let line1Sum = lines1Known.reduce((acc, x) => acc + x.getValue(), 0);
        let line2Sum = lines2Known.reduce((acc, x) => acc + x.getValue(), 0);

        if (line1Sum !== line2Sum) {
            return false;
        }

        for (let line of lines1Unknown) {
            let line2 = lines2Unknown.find((x) => x.getName() === line.getName());
            if (!line2) {
                return false;
            }
        }
        return true;
    },

    isConnected(lineSum) {
        return this.getDot1() === lineSum.getDot1() ||
            this.getDot1() === lineSum.getDot2() ||
            this.getDot2() === lineSum.getDot1() ||
            this.getDot2() === lineSum.getDot2();
    },

    isLineEnd(dot) {
        return this._dot1 === dot || this._dot2 === dot;
    },

    getBase() {
        return this._lines[0].getBase();
    },

    getBaseOrSelf() {
        return this._lines[0].getBaseOrSelf();
    },

    getSegments() {
        return this._lines.reduce(function (acc, x) {
            for (let seg of x.getSegments()) {
                acc.push(seg);
            }
            return acc;
        }, [])
    },

    equals(lineSum) {
        for (let i = 0; i < this._lines.length; i++) {
            let line1 = this._lines[i];
            let line2 = lineSum.getLine(i);
            if (line1 !== line2) {
                return false;
            }
        }
        return true;
    },

    toString() {
        return this._lines.map((x) => x.getName()).join(' + ');
    }
}

export default LineSum;