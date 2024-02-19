'use strict';

function Parallel(lines) {
    this._lines = lines || [];
}

Parallel.prototype = {

    get(i) {
        return this._lines[i];
    },

    getLines() {
        return this._lines;
    },

    add(line) {
        this._lines.push(line);
        return this;
    },

    contains(l1) {
        for (let l2 of this._lines) {
            if (l1 === l2) {
                return true;
            }
        }
        return false;
    },

    containsList(list) {
        for (let line of list) {
            if (this.contains(line)) {
                return true;
            }
        }
        return false;
    },

    toString() {
        return this._lines.map((x) => x.getName()).join(' // ');
    }
}

export default Parallel;