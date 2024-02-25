'use strict';

import AngleSum from "../../models/solve/angleSum.js";

export function areEquivalent(equivalents, val1, val2) {
    if (val1 instanceof AngleSum && val2 instanceof AngleSum) {
        let elements1 = val1.getAngles();
        let elements2 = val2.getAngles();
        let unknowns1 = elements1.filter((x) => !x.isKnown());
        let unknowns2 = elements2.filter((x) => !x.isKnown());
        let knowns1 = elements1.filter((x) => x.isKnown());
        let knowns2 = elements2.filter((x) => x.isKnown());

        if (unknowns1.length !== unknowns2.length) {
            return false;
        }

        let sum1 = knowns1.reduce((acc, x) => acc + x.getValue(), 0);
        let sum2 = knowns2.reduce((acc, x) => acc + x.getValue(), 0);

        if (sum1 !== sum2) {
            return false;
        }

        let used = [];
        for (let val1 of unknowns1) {
            let val2 = unknowns2.find((x) => used.indexOf(x) === -1 &&
                valuesAreEquivalent(equivalents, val1, x));
            if (!val2) {
                return false;
            } else {
                used.push(val2);
            }
        }

        return true;
    }

    return valuesAreEquivalent(equivalents, val1, val2);
}

function valuesAreEquivalent(equivalents, val1, val2) {
    if (val1 === val2) {
        return true;
    }
    if (val1.getValue() && val1.getValue() === val2.getValue()) {
        return true;
    }
    for (let equi of equivalents) {
        if (equi.contains(val1) && equi.contains(val2)) {
            return true;
        }
    }
    return false;
}

export function getNarrowAngle(angles, line1, line2) {
    let ang1 = getNarrowAngleWithLines(angles, line1, line2);
    if (ang1) {
        return ang1;
    }
    let base1 = line1.getBase();
    let base2 = line2.getBase();
    if (base1 && base2) {
        return getNarrowAngleWithLines(angles, base1, base2);
    }
}

export function getNarrowAngleWithLines(angles, line1, line2) {
    for (let ang of angles) {
        if (ang.getLine1() === line1 && ang.getLine2() === line2) {
            if (ang.getCanvasAngle() < 180) {
                return ang;
            }
        }
        if (ang.getLine1() === line2 && ang.getLine2() === line1) {
            if (ang.getCanvasAngle() < 180) {
                return ang;
            }
        }
    }
    return null;
}

export function linesMatchAngle(ang, line1, line2) {
    if (ang.getLine1() === line1 && ang.getLine2() === line2) {
        return true;
    }
    if (ang.getLine1() === line2 && ang.getLine2() === line1) {
        return true;
    }

    if (ang.getLine1().getBase() === line1 && ang.getLine2() === line2) {
        return true;
    }
    if (ang.getLine1() === line1 && ang.getLine2().getBase() === line2) {
        return true;
    }

    if (ang.getLine1().getBase() === line2 && ang.getLine2() === line1) {
        return true;
    }
    if (ang.getLine1() === line2 && ang.getLine2().getBase() === line1) {
        return true;
    }

    if (ang.getLine1().getBase() === line1 &&
        ang.getLine2().getBase() === line2 &&
        ang.getLine1().getBase()) {
        return true;
    }
    if (ang.getLine1().getBase() === line2 &&
        ang.getLine2().getBase() === line1 &&
        ang.getLine1().getBase()) {
        return true;
    }

    return false;
}

export function getAllLines(lines) {
    return lines.reduce(function (acc, x) {
        for (let seg of x.getSegments()) {
            acc.push(seg);
        }
        return acc;
    }, lines);
}