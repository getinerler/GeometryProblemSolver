'use strict';

function AngleSum(angle) {
    this._angles = angle ? [angle] : [];
}

AngleSum.prototype = {

    getAngles() {
        return this._angles;
    },

    addAngle(ang) {
        this._angles
            .push(ang)
            .sort(function (ang1, ang2) {
                let line1 = ang1.getLine1();
                let line2 = ang2.getLine1();
                if (line1.getAngle() > line2.getAngle()) {
                    return 1;
                } else if (line1.getAngle() < line2.getAngle()) {
                    return -1;
                } else {
                    return 0;
                }
            });
    },

    getLine1() {
        return this._angles[0].getLine1();
    },

    getLine2() {
        return this._angles[this._angles.length - 1].getLine2();
    },

    getValue() {
        let unknowns = this._angles.filter((x) => !x.isKnown());
        if (unknowns.length > 0) {
            return null;
        }
        return this._angles.reduce((acc, x) => acc + x.getValue(), 0);
    },

    isKnown() {
        for (let ang of this._angles) {
            if (!ang.isKnown()) {
                return false;
            }
        }
        return true;
    },

    valueEqual(val) {
        let unknowns = this._angles.filter((x) => !x.isKnown());
        if (unknowns.length > 0) {
            return false;
        }

        let sum = this._angles.reduce((acc, x) => acc + x.getValue(), 0);
        return val === sum;
    },

    equals(angSum) {
        let angs1 = this._angles;
        let angs2 = angSum.getAngles();

        let angs1Unknown = angs1.filter((x) => !x.isKnown());
        let angs2Unknown = angs2.filter((x) => !x.isKnown());

        if (angs1.length !== angs2.length) {
            if (angs1Unknown.length > 0) {
                return false;
            }
            if (angs2Unknown.length > 0) {
                return false;
            }
            let ang1Sum = angs1.reduce((acc, x) => acc + x.getValue(), 0);
            let ang2Sum = angs2.reduce((acc, x) => acc + x.getValue(), 0);
            return ang1Sum === ang2Sum;
        }

        let angs1Known = angs1.filter((x) => x.isKnown());
        let angs2Known = angs2.filter((x) => x.isKnown());

        if (angs1Known.length !== angs2Known.length) {
            return false;
        }
        let ang1Sum = angs1Known.reduce((acc, x) => acc + x.getValue(), 0);
        let ang2Sum = angs2Known.reduce((acc, x) => acc + x.getValue(), 0);

        if (ang1Sum !== ang2Sum) {
            return false;
        }

        for (let ang of angs1Unknown) {
            let ang2 = angs2Unknown.find((x) => x.getName() === ang.getName());
            if (!ang2) {
                return false;
            }
        }
        return true;
    },

    toString() {
        return this._angles.map((x) => x.getName()).join(' + ');
    }
}

export default AngleSum;