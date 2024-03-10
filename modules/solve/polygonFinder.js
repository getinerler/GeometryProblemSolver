'use strict';

import { getAllLines } from '../../modules/solve/solveCommon.js';
import Triangle from '../../models/solve/triangle.js';
import Rectangle from '../../models/solve/rectangle.js';
import AngleSum from '../../models/solve/angleSum.js';
import LineSum from '../../models/solve/lineSum.js';

function PolygonFinder(question) {
    this.dots = question.dots;
    this.angles = question.angles;
    this.unknown = question.question;
    this.allLines = getAllLines(question.lines);
    this.triangles = [];
    this.rectangles = [];
}

PolygonFinder.prototype = {

    findPolygons() {
        for (let line of this.allLines) {
            this.findPolygons2(line);
        }
        return {
            triangles: this.triangles,
            rectangles: this.rectangles
        }
    },

    findPolygons2(line1) {
        for (let line2 of this.allLines) {
            if (line1 === line2) {
                continue;
            }
            if (!line1.isConnected(line2)) {
                continue;
            }
            if (line1.getBaseOrSelf() === line2.getBaseOrSelf()) {
                continue;
            }
            this.findPolygons3(line1, line2);
        }
    },

    findPolygons3(line1, line2) {
        for (let line3 of this.allLines) {
            if (line1 === line3 || line2 === line3) {
                continue;
            }
            if (!line2.isConnected(line3)) {
                continue;
            }
            if (line1.getBaseOrSelf() === line3.getBaseOrSelf() ||
                line2.getBaseOrSelf() === line3.getBaseOrSelf()) {
                continue;
            }
            if (line1.isConnected(line3)) {
                this.checkTriangle(line1, line2, line3);
            }
            this.findPolygons4(line1, line2, line3);
        }
    },

    findPolygons4(line1, line2, line3) {
        for (let line4 of this.allLines) {
            if (line1 === line4 || line2 === line4 || line3 === line4) {
                continue;
            }
            if (line1.getBaseOrSelf() === line4.getBaseOrSelf() ||
                line2.getBaseOrSelf() === line4.getBaseOrSelf() ||
                line3.getBaseOrSelf() === line4.getBaseOrSelf()) {
                continue;
            }
            if (!line3.isConnected(line4)) {
                continue;
            }
            if (line1.isConnected(line4)) {
                this.createRectangle(line1, line2, line3, line4);
            }
        }
    },

    checkTriangle(line1, line2, line3) {
        let dot1 = this.getLinesCommonDot(line1, line2);
        let dot2 = this.getLinesCommonDot(line2, line3);
        let dot3 = this.getLinesCommonDot(line3, line1);

        if (dot1 === dot2 || dot2 === dot3 || dot1 === dot3) {
            return;
        }

        let ang1 = this.getAngleSum(line1, line2);
        let ang2 = this.getAngleSum(line2, line3);
        let ang3 = this.getAngleSum(line3, line1);

        let dots = [dot1, dot2, dot3];
        let lines = [new LineSum(line1), new LineSum(line2), new LineSum(line3)];
        let angles = [ang1, ang2, ang3];
        let tri = new Triangle(dots, lines, angles);

        let old = this.triangles.find(function (x) {
            if (!x.getLines().find((x) => x.equals(new LineSum(line1)))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(new LineSum(line2)))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(new LineSum(line3)))) {
                return false;
            }
            return true;
        })
        if (!old) {
            this.triangles.push(tri);
        }
    },

    createRectangle(line1, line2, line3, line4) {
        let dot1 = this.getLinesCommonDot(line1, line2);
        let dot2 = this.getLinesCommonDot(line2, line3);
        let dot3 = this.getLinesCommonDot(line3, line4);
        let dot4 = this.getLinesCommonDot(line4, line1);

        let ang1 = this.getAngleSum(line1, line2);
        let ang2 = this.getAngleSum(line2, line3);
        let ang3 = this.getAngleSum(line3, line4);
        let ang4 = this.getAngleSum(line4, line1);

        let dots = [dot1, dot2, dot3, dot4];
        let lines = [
            new LineSum(line1),
            new LineSum(line2),
            new LineSum(line3),
            new LineSum(line4)
        ];
        let angles = [ang1, ang2, ang3, ang4];
        let rect = new Rectangle(dots, lines, angles);

        let old = this.rectangles.find(function (x) {
            if (!x.getLines().find((x) => x.equals(new LineSum(line1)))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(new LineSum(line2)))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(new LineSum(line3)))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(new LineSum(line4)))) {
                return false;
            }
            return true;
        })
        if (!old) {
            this.rectangles.push(rect);
        }
    },

    getLinesCommonDot(line1, line2) {
        if (line1.isLineEnd(line2.getDot1())) {
            return line2.getDot1();
        }
        if (line1.isLineEnd(line2.getDot2())) {
            return line2.getDot2();
        }
        return null;
    },

    getAngleSum(line1, line2) {
        let commonDot = this.getLinesCommonDot(line1, line2);

        let angles = this.angles.filter((x) => x.getDot() === commonDot);
        let angles1 = [];
        let angles2 = [];

        let tempAng = null;
        let tempLine = null;

        tempLine = line1;
        let count = 0;
        do {
            let ang = angles.find(function (x) {
                if (x === tempAng) {
                    return false;
                }
                if (x.getLine1() === tempLine) {
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
                angles1.push(ang);
                tempLine = ang.getLine2();
            }
            count++;
        } while (
            tempLine !== line2 &&
            tempLine.getBase() !== line2 &&
            count < this.angles.length);

        tempLine = line2;
        tempAng = null;
        count = 0;
        do {
            let ang = angles.find(function (x) {
                if (x === tempAng) {
                    return false;
                }
                if (x.getLine1() === tempLine) {
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
                angles2.push(ang);
                tempLine = ang.getLine2();
            }
            count++;
        } while (
            tempLine !== line1 &&
            tempLine.getBase() !== line1 &&
            count < this.angles.length);

        let canvasAngleSum1 = angles1.reduce((acc, x) => acc + x.getCanvasAngle(), 0);
        let angleSum = new AngleSum(canvasAngleSum1 > 180 ? angles2 : angles1);
        return angleSum;
    },

    getAngleSumWithLines(line1, line2) {
        for (let ang of this.angles) {
            if (this.linesMatchAngle(ang, line1, line2)) {
                if (ang.getCanvasAngle() < 180) {
                    return ang;
                }
            }
        }
        return null;
    },

    linesMatch(line1, line2) {
        if (line1 === line2) {
            return true;
        }
        if (line1.getBase() === line2) {
            return true;
        }
        if (line1 === line2.getBase()) {
            return true;
        }
        return line1.getBaseOrSelf() === line2.getBaseOrSelf();
    },

    linesMatchAngle(ang, line1, line2) {
        if (ang.getLine1() === line1 && ang.getLine2() === line2) {
            return true;
        }
        if (ang.getLine1().getBase() === line1 && ang.getLine2() === line2) {
            return true;
        }
        if (ang.getLine1() === line1 && ang.getLine2().getBase() === line2) {
            return true;
        }
        if (ang.getLine1().getBase() === line1 &&
            ang.getLine2().getBase() === line2 &&
            ang.getLine1().getBase()) {
            return true;
        }
        return false;
    }
}

export default PolygonFinder;