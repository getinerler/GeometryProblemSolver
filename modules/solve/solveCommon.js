'use strict';

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