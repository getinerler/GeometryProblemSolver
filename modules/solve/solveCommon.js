'use strict';

import AngleSum from "../../models/solve/angleSum.js";
import LineSum from "../../models/solve/lineSum.js";

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
        for (let un1 of unknowns1) {
            let un2 = unknowns2.find((x) => used.indexOf(x) === -1 &&
                valuesAreEquivalent(equivalents, un1, x));
            if (!un2) {
                return false;
            }
        }
        return true;
    }
    if (val1 instanceof LineSum && val2 instanceof LineSum) {
        let elements1 = val1.getLines();
        let elements2 = val2.getLines();
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
        for (let un1 of unknowns1) {
            let un2 = unknowns2.find((x) => used.indexOf(x) === -1 &&
                valuesAreEquivalent(equivalents, un1, x));
            if (!un2) {
                return false;
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
    if (val1.getType() !== val2.getType()) {
        return false;
    }
    if (val1.getValue() && val1.getValue() === val2.getValue()) {
        return true;
    }
    for (let equi of equivalents) {
        if (equi.contains(val1) && equi.contains(val2)) {
            return true;
        }
        if (equi.getType() === "AngleSum" && val1.getType() === "Angle") {
            let elements = equi.getElements();
            let el1 = elements.find((x) => x.isEquivalent(new AngleSum([val1])));
            let el2 = elements.find((x) => x.isEquivalent(new AngleSum([val2])));

            if (el1 && el2) {
                return true;
            }
        }
        if (equi.getType() === "Line" && val1.getType() === "Line") {
            let elements = equi.getElements();
            let el1 = elements.find((x) => x === val1);
            let el2 = elements.find((x) => x === val2);

            if (el1 && el2) {
                return true;
            }
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
        if (new LineSum(ang.getLine1()).equals(line1) &&
            new LineSum(ang.getLine2()).equals(line2)) {
            if (ang.getCanvasAngle() < 180) {
                return ang;
            }
        }
        if (new LineSum(ang.getLine1()).equals(line2) &&
            new LineSum(ang.getLine2()).equals(line1)) {
            if (ang.getCanvasAngle() < 180) {
                return ang;
            }
        }
    }
    return null;
}

export function linesMatchAngle(ang, line1, line2) {
    for (let l1 of line1.getLines()) {
        if (l1.isLineEnd(ang.getDot())) {
            line1 = l1;
        }
    }
    for (let l2 of line2.getLines()) {
        if (l2.isLineEnd(ang.getDot())) {
            line2 = l2;
        }
    }
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
    let allLines = [];
    for (let line of lines) {
        let lineList = getAllLineCombinations(line);
        for (let l of lineList) {
            allLines.push(l);
        }
    }
    return allLines;
}


export function getLinesCommonDot(line1, line2) {
    if (line1.isLineEnd(line2.getDot1())) {
        return line2.getDot1();
    }
    if (line1.isLineEnd(line2.getDot2())) {
        return line2.getDot2();
    }
    return null;
}

export function getOrderedAngleSum(angs, line1, line2) {
    let commonDot = getLinesCommonDot(line1, line2);

    for (let ang of angs) {
        if (ang.getCanvasAngle() >= 180) {
            continue;
        }
        if (ang.getDot() !== commonDot) {
            continue;
        }
        if (new LineSum(ang.getLine1()).equals(line1) &&
            new LineSum(ang.getLine2()).equals(line2)) {
            return [ang];
        }
        if (new LineSum(ang.getLine1()).equals(line2) &&
            new LineSum(ang.getLine2()).equals(line1)) {
            return [ang];
        }
    }

    let angles = angs.filter((x) => x.getDot() === commonDot);
    let anglesList = [];
    let tempAng = null;
    let tempLine = null;

    if (line1.getLines().length > 1) {
        let mainLine = line1.getLines().find((x) => x.isLineEnd(commonDot));
        line1 = new LineSum(mainLine);
    }
    if (line2.getLines().length > 1) {
        let mainLine = line2.getLines().find((x) => x.isLineEnd(commonDot));
        line2 = new LineSum(mainLine);
    }

    tempLine = line1;
    let count = 0;
    do {
        let ang = angles.find(function (x) {
            if (x === tempAng) {
                return false;
            }
            if (new LineSum(x.getLine1()).equals(tempLine)) {
                return true;
            }
            for (let seg of tempLine.getSegments()) {
                if (seg.isLineEnd(commonDot) && x.getLine1() === seg) {
                    return true;
                }
            }
            return false;
        });

        if (ang) {
            tempAng = ang;
            anglesList.push(ang);
            tempLine = new LineSum(ang.getLine2());
        }
        count++;
    } while (
        !tempLine.equals(line2) &&
        !new LineSum(tempLine.getBaseOrSelf()).equals(line2) &&
        count < angs.length);

    return anglesList;
}

function getAllLineCombinations(line) {
    let list = [];
    list.push(new LineSum(line));
    let orderedSegments = getOrderedSegments(line);
    for (let i = 0; i < orderedSegments.length; i++) {
        for (let j = i; j < orderedSegments.length; j++) {
            if (i === 0 && j === orderedSegments.length - 1) {
                continue;
            }
            list.push(new LineSum(orderedSegments.slice(i, j + 1)));
        }
    }
    return list;
}

function getOrderedSegments(line) {
    let seg = line.getSegments().find((x) => x.isLineEnd(line.getDot1()));
    let list = [];
    while (seg) {
        list.push(seg);
        seg = line.getSegments().find((x) => list.indexOf(x) === -1 && seg.isConnected(x));
        if (seg.isLineEnd(line.getDot2())) {
            list.push(seg);
            break;
        }
    }
    return list;
}