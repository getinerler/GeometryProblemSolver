'use strict';

function LineSum(lines) {
    this._lines = [];
    if (Array.isArray(lines)) {
        for (let line of lines) {
            this.addline(line);
        }
    } else if (lines) {
        this._lines = [lines];
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
        this._lines.push(line);
    },

    getDot1() {
        return this._lines[0].getDot1();
    },

    getDot2() {
        return this._lines[this._lines.length - 1].getDot2();
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