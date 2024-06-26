'use strict';

import Point from '../../models/graphic/point.js';
import Line from '../../models/graphic/line.js';

let segmentDistance = 15;
let angleDistance = 30;
let dotDistance = 10;
let distance = 35;
let angleTextDistance = 25;

export function isPerpendicular(line1, line2) {
    let s1 = getSlopeRatio(line1.getDot1(), line1.getDot2());
    let s2 = getSlopeRatio(line2.getDot1(), line2.getDot2());
    if ((s1 == 50000 && s2 == 0) || (s2 == 50000 && s1 == 0)) {
        return true;
    }
    let dif = s1 * s2;
    return dif > -1.05 && dif < -0.95;
}

export function getLineAngle(line, refDot) {
    if (!line || !refDot) {
        return null;
    }
    let movingDot = line.getDot1() === refDot ? line.getDot2() : line.getDot1();
    return getAngle(movingDot, refDot);
}

export function getAngle(dot1, dot2) {
    let ang = getSlopeAngle(dot1, dot2);
    if (dot1.getX() > dot2.getX() && dot1.getY() == dot2.getY()) return 0;
    else if (dot1.getX() > dot2.getX() && dot1.getY() > dot2.getY()) return ang;
    else if (dot1.getX() == dot2.getX() && dot1.getY() > dot2.getY()) return 90;
    else if (dot1.getX() < dot2.getX() && dot1.getY() == dot2.getY()) return 180;
    else if (dot1.getX() == dot2.getX() && dot1.getY() < dot2.getY()) return 270;
    else if (dot1.getX() < dot2.getX() && dot1.getY() > dot2.getY()) return 180 + ang;
    else if (dot1.getX() < dot2.getX() && dot1.getY() < dot2.getY()) return 180 + ang;
    else if (dot1.getX() > dot2.getX() && dot1.getY() < dot2.getY()) return 360 + ang;
    return 0;
}

export function getAngleDegree(ang) {
    if (!ang) {
        return NaN;
    }
    let degree1 = getAngle(ang.getDot(), ang.getLine1().getOtherDot(ang.getDot()));
    let degree2 = getAngle(ang.getDot(), ang.getLine2().getOtherDot(ang.getDot()));
    if (degree1 < degree2) {
        return degree2 - degree1;
    } else {
        return 360 - degree1 + degree2;
    }
}

export function getLineAngleRadian(line, refDot) {
    return getLineAngle(line, refDot) * Math.PI / 180;
}

export function dotBetweenAngle(ang, point) {
    let startAngle = getLineAngle(ang.getLine1(), ang.getDot());
    let endAngle = getLineAngle(ang.getLine2(), ang.getDot());

    let pointAngle = getLineAngle(new Line(ang.getDot(), point), ang.getDot());

    // 0 point is in-between
    if (startAngle > endAngle) {
        if ((pointAngle > startAngle && pointAngle < 360) ||
            (pointAngle > 0 && pointAngle < endAngle)) {
            return true;
        }
    } else {
        if (startAngle < pointAngle && pointAngle < endAngle) {
            return true;
        }
    }
    return false;
}

export function linesParallel(line1, line2) {
    let m1 = getSlopeAngle(line1.getDot1(), line1.getDot2());
    let m2 = getSlopeAngle(line2.getDot1(), line2.getDot2());
    return Math.abs(m1 - m2) < 2;
}

export function lineIntersect(line1, line2) {
    /*y1 = m1.x1 + a1;
      y2 = m2.x2 + a2;*/
    let m1 = getSlopeRatio(line1.getDot1(), line1.getDot2());
    let m2 = getSlopeRatio(line2.getDot1(), line2.getDot2());

    let a1 = (line1.getY1() - line1.getX1() * m1);
    let a2 = (line2.getY1() - line2.getX1() * m2);

    // Lines are parallel
    if (m1 == m2) {
        return null;
    }

    let x = (a2 - a1) / (m1 - m2);
    let y = m1 * x + a1;

    let point = new Point(x, y);

    if (!dotBetweenLineSegment(point, line1)) {
        return null;
    }
    if (!dotBetweenLineSegment(point, line2)) {
        return null;
    }

    //One of the lines has infinitive slope
    if (m1 == 50000) {
        return new Point(line1.getX1(), line1.getX1() * m2 + a2);
    }
    if (m2 == 50000) {
        return new Point(line2.getX1(), line2.getX1() * m1 + a1);
    }

    // Intersection dot is so close to start or end dot
    if (dotsCloser(line1.getDot1(), point) ||
        dotsCloser(line1.getDot2(), point)) {
        return null;
    }
    if (dotsCloser(line2.getDot1(), point) ||
        dotsCloser(line2.getDot2(), point)) {
        return null;
    }
    return point;
}

export function dotsCloser(dot1, dot2) {
    return getDistance(dot1, dot2) < dotDistance;
}

export function anglesCloser(dot1, dot2) {
    return getDistance(dot1, dot2) < angleDistance;
}

export function getDistance(dot1, dot2) {
    let xSqrt = Math.pow(dot2.getX() - dot1.getX(), 2);
    let ySqrt = Math.pow(dot2.getY() - dot1.getY(), 2);
    return Math.sqrt(xSqrt + ySqrt);
}

export function dotOnLine(line, dot) {
    if (!(line && dot)) {
        return false;
    }
    if (!dotBetweenLineSegment(dot, line)) {
        return false;
    }
    return Math.floor(lineDotDistance(line, dot)) < distance;
}

export function dotOnCircle(circ, dot) {
    return Math.abs(getDistance(circ.getDot(), dot) - circ.getRadius()) < 5;
}

//http://ambrnet.com/TrigoCalc/Circles2/circlrLine_.htm
export function getLineCircleIntersection(circ, line) {
    // y = m.x + a;
    let m = getSlopeRatio(line.getDot1(), line.getDot2());
    let a = line.getY2() - m * line.getX2();
    let d = (Math.pow(circ.getRadius(), 2) * (1 + Math.pow(m, 2))) -
        Math.pow((circ.getY() - m * circ.getX() - a), 2);

    if (d < 0) {
        return [];
    }

    let points = [];

    let x1 = (circ.getX() + circ.getY() * m - a * m + Math.sqrt(d)) / (1 + Math.pow(m, 2));
    let y1 = m * x1 + a;
    let dot1 = new Point(x1, y1);
    if (d == 0 && dotOnLineSegment(line, dot1)) {
        points.push(dot1);
    } else {
        let x2 = (circ.getX() + circ.getY() * m - a * m - Math.sqrt(d)) / (1 + Math.pow(m, 2));
        let y2 = m * x2 + a;
        let dot2 = new Point(x2, y2);
        if (dotOnLineSegment(line, dot1)) {
            points.push(dot1);
        }
        if (dotOnLineSegment(line, dot2)) {
            points.push(dot2);
        }
    }
    return points;
}

export function dotOnLineSegment(line, dot) {
    if (!(line && dot)) {
        return false;
    }
    if (!dotBetweenLineSegment(dot, line)) {
        return false;
    }
    return Math.floor(lineDotDistance(line, dot)) < segmentDistance;
}

export function getLongLine(line) {
    let ang = getAngle(line.getDot1(), line.getDot2());
    let dot1 = dotFromDotSlopeDistance(line.getDot1(), ang, -1000);
    let dot2 = dotFromDotSlopeDistance(line.getDot1(), ang, 1000);
    return new Line(dot1, dot2, '');
}

export function getDotsLineRatio(dot, line) {
    let lineLength = getDistance(line.getDot1(), line.getDot2());
    let dotDistance = getDistance(line.getDot1(), dot);
    return dotDistance / lineLength;
}

export function getDotOnLineWithRatio(dot) {
    let line = dot.getBaseLine();
    let xM = line.getX1() > line.getX2() ? -1 : 1;
    let yM = line.getY1() > line.getY2() ? -1 : 1;
    let x = line.getX1() + Math.abs(line.getX1() - line.getX2()) * dot.getLineRatio() * xM;
    let y = line.getY1() + Math.abs(line.getY1() - line.getY2()) * dot.getLineRatio() * yM;
    return new Point(x, y);
}

export function getAngleSimilarSymbolI(ang) {
    let dot = new Point(ang.getDot().getX() + angleTextDistance / 2, ang.getDot().getY());
    let smaller = getAngle(ang.getDot(), ang.getLine1().getOtherDot(ang.getDot()));
    let greater = getAngle(ang.getDot(), ang.getLine2().getOtherDot(ang.getDot()));
    let middle = greater > smaller ?
        (greater - smaller) / 2 + smaller :
        (360 - smaller + greater) / 2 + smaller;
    return rotate(ang.getDot(), dot, middle);
}

export function getAngleTextPoint(ang, textWidth) {
    let dot = new Point(
        ang.getDot().getX() + 20,
        ang.getDot().getY());
    let smaller = getAngle(ang.getDot(), ang.getLine1().getOtherDot(ang.getDot()));
    let greater = getAngle(ang.getDot(), ang.getLine2().getOtherDot(ang.getDot()));
    let middle = greater > smaller ?
        (greater - smaller) / 2 + smaller :
        (360 - smaller + greater) / 2 + smaller;
    return rotate(ang.getDot(), dot, middle);
}

export function getLineTextPoint(line) {
    let middleX = (line.getX1() + line.getX2()) / 2;
    let middleY = (line.getY1() + line.getY2()) / 2;
    return new Point(middleX, middleY);
}

export function get90DegreeSymbolPoints(ang) {
    let line90 = 13;
    let dot1 = new Point(ang.getDot().getX(), ang.getDot().getY() + line90);
    let dot2 = new Point(ang.getDot().getX() + line90, ang.getDot().getY() + line90);
    let dot3 = new Point(ang.getDot().getX() + line90, ang.getDot().getY());
    let rotationAngle = getAngle(ang.getDot(), ang.getLine1().getOtherDot(ang.getDot()));
    dot1 = rotate(ang.getDot(), dot1, rotationAngle);
    dot2 = rotate(ang.getDot(), dot2, rotationAngle);
    dot3 = rotate(ang.getDot(), dot3, rotationAngle);
    return [ang.getDot(), dot1, dot2, dot3];
}

export function getLineSimilarSymbolLine1(line) {
    let middleX = (line.getX1() + line.getX2()) / 2;
    let middleY = (line.getY1() + line.getY2()) / 2;
    let ang = (getSlopeAngle(line.getDot1(), line.getDot2()) + 90) * Math.PI / 180;
    let x1 = middleX - 5 * Math.cos(ang);
    let y1 = middleY - 5 * Math.sin(ang);
    let x2 = middleX + 5 * Math.cos(ang);
    let y2 = middleY + 5 * Math.sin(ang);
    return [new Point(x1, y1), new Point(x2, y2)];
}

export function getLineSimilarSymbolLine2(line) {
    let x1M = line.getX1() > line.getX2() ? -1 : 1;
    let y1M = line.getY1() > line.getY2() ? -1 : 1;
    let middleX1 = line.getX1() + Math.abs(line.getX1() - line.getX2()) * 0.49 * x1M;
    let middleY1 = line.getY1() + Math.abs(line.getY1() - line.getY2()) * 0.49 * y1M;

    let x2M = line.getX1() > line.getX2() ? -1 : 1;
    let y2M = line.getY1() > line.getY2() ? -1 : 1;
    let middleX2 = line.getX1() + Math.abs(line.getX1() - line.getX2()) * 0.51 * x2M;
    let middleY2 = line.getY1() + Math.abs(line.getY1() - line.getY2()) * 0.51 * y2M;

    let ang = (getSlopeAngle(line.getDot1(), line.getDot2()) + 90) * Math.PI / 180;
    let x1 = middleX1 - 5 * Math.cos(ang);
    let y1 = middleY1 - 5 * Math.sin(ang);
    let x2 = middleX1 + 5 * Math.cos(ang);
    let y2 = middleY1 + 5 * Math.sin(ang);
    let x3 = middleX2 - 5 * Math.cos(ang);
    let y3 = middleY2 - 5 * Math.sin(ang);
    let x4 = middleX2 + 5 * Math.cos(ang);
    let y4 = middleY2 + 5 * Math.sin(ang);

    return [new Point(x1, y1), new Point(x2, y2), new Point(x3, y3), new Point(x4, y4)];
}

export function getDotNamePoint(dot, ang, line) {
    if (!ang) {
        let p1 = new Point(dot.getX() + 20, dot.getY());
        let p2 = new Point(dot.getX() - 20, dot.getY());
        if (line) {
            return dotBetweenLineSegment(p1, line) ? p2 : p1;
        } else {
            return p1;
        }
    }
    let smaller = getAngle(ang.getDot(), ang.getLine1().getOtherDot(ang.getDot()));
    let greater = getAngle(ang.getDot(), ang.getLine2().getOtherDot(ang.getDot()));
    let middle = greater > smaller ?
        (greater - smaller) / 2 + smaller :
        (360 - smaller + greater) / 2 + smaller;
    return rotate(ang.getDot(), new Point(dot.getX() + 15, dot.getY()), middle);
}

export function dotBetweenLineSegment(dot, line) {
    if (dot.getX() > Math.max(line.getX1(), line.getX2())) {
        return false;
    }
    if (dot.getX() < Math.min(line.getX1(), line.getX2())) {
        return false;
    }
    if (dot.getY() > Math.max(line.getY1(), line.getY2())) {
        return false;
    }
    if (dot.getY() < Math.min(line.getY1(), line.getY2())) {
        return false;
    }
    return true;
}

function rotate(ref, dot, ang) {
    ang = getAngle(ref, dot) + ang;
    let dist = getDistance(dot, ref);
    let xDiff = dist * Math.cos(ang * Math.PI / 180);
    let yDiff = dist * Math.sin(ang * Math.PI / 180);
    return new Point(ref.getX() + xDiff, ref.getY() + yDiff);
}

function dotFromDotSlopeDistance(dot, ang, distance) {
    let dot2 = new Point(dot.getX() + distance, dot.getY());
    return rotate(dot, dot2, ang);
}

function lineDotDistance(line, dot) {
    let slope = getSlopeRatio(line.getDot1(), line.getDot2());
    // √(A² + B²)
    let sqrt = Math.sqrt(1 + Math.pow(slope, 2));
    // ∣Am + Bn + C∣
    let sumAbs = Math.abs(dot.getY() - slope * dot.getX() + slope * line.getX2() - line.getY2());
    // ∣Am + Bn + C∣ / √(A²+B²)
    return sumAbs / sqrt;
}

function getSlopeRatio(dot1, dot2) {
    if (dot2.getX() == dot1.getX()) {
        return 50000;
    }
    return (dot2.getY() - dot1.getY()) / (dot2.getX() - dot1.getX());
}

function getSlopeAngle(dot1, dot2) {
    return Math.atan(getSlopeRatio(dot1, dot2)) * 180 / Math.PI;
}