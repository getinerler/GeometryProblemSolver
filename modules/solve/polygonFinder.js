'use strict';

import { getAllLines, getOrderedAngleSum } from '../../modules/solve/solveCommon.js';
import { getLinesCommonDot } from '../../modules/solve/solveCommon.js';
import Triangle from '../../models/solve/triangle.js';
import Rectangle from '../../models/solve/rectangle.js';
import AngleSum from '../../models/solve/angleSum.js';
import LineSum from '../../models/solve/lineSum.js';
import { lineIntersect } from '../../modules/graphic/geoHelper.js';
import Line from '../../models/graphic/line.js';

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
            if (line1.equals(line2)) {
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
            if (line1.equals(line3) || line2.equals(line3)) {
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
            if (line1.equals(line4) || line2.equals(line4) || line3.equals(line4)) {
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
        let dot1 =  getLinesCommonDot(line1, line2);
        let dot2 =  getLinesCommonDot(line2, line3);
        let dot3 =  getLinesCommonDot(line3, line1);

        if (dot1 === dot2 || dot2 === dot3 || dot1 === dot3) {
            return;
        }

        let ang1 = this.getAngleSum(line1, line2);
        let ang2 = this.getAngleSum(line2, line3);
        let ang3 = this.getAngleSum(line3, line1);

        let dots = [dot1, dot2, dot3];
        let lines = [line1, line2, line3];
        let angles = [ang1, ang2, ang3];
        let tri = new Triangle(dots, lines, angles);

        let old = this.triangles.find(function (x) {
            if (!x.getLines().find((x) => x.equals(line1))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(line2))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(line3))) {
                return false;
            }
            return true;
        })
        if (!old) {
            console.log(tri)
            this.triangles.push(tri);
        }
    },

    createRectangle(line1, line2, line3, line4) {
        let intersection13 = lineIntersect(
            new Line(line1.getDot1(), line1.getDot2()),
            new Line(line3.getDot1(), line3.getDot2()));
        let intersection24 = lineIntersect(
            new Line(line2.getDot1(), line2.getDot2()),
            new Line(line4.getDot1(), line4.getDot2()));

        if (intersection13 || intersection24) {
            return;
        }

        let dot1 =  getLinesCommonDot(line1, line2);
        let dot2 =  getLinesCommonDot(line2, line3);
        let dot3 =  getLinesCommonDot(line3, line4);
        let dot4 =  getLinesCommonDot(line4, line1);

        if (dot1 === dot2 || dot2 === dot3 || dot3 === dot4 || dot1 === dot4) {
            return;
        }

        let ang1 = this.getAngleSum(line1, line2);
        let ang2 = this.getAngleSum(line2, line3);
        let ang3 = this.getAngleSum(line3, line4);
        let ang4 = this.getAngleSum(line4, line1);

        let dots = [dot1, dot2, dot3, dot4];
        let lines = [line1, line2, line3, line4];
        let angles = [ang1, ang2, ang3, ang4];
        let rect = new Rectangle(dots, lines, angles);

        let old = this.rectangles.find(function (x) {
            if (!x.getLines().find((x) => x.equals(line1))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(line2))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(line3))) {
                return false;
            } else if (!x.getLines().find((x) => x.equals(line4))) {
                return false;
            }
            return true;
        })
        if (!old) {
            this.rectangles.push(rect);
        }
    },

    getAngleSum(line1, line2) {
        let anglesList = getOrderedAngleSum(this.angles, line1, line2);
        let anglesList2 = getOrderedAngleSum(this.angles, line2, line1);
        let canvasAngleSum1 = anglesList.reduce((acc, x) => acc + x.getCanvasAngle(), 0);
        let angleSum = new AngleSum(canvasAngleSum1 > 180 ? anglesList2 : anglesList);
        if (angleSum.getAngles().length === 0) {
            throw 'No angle for ' + line1.toString() + "-" + line2.toString();
        }
        return angleSum;
    },

    linesMatch(line1, line2) {
        if (line1.equals(line2)) {
            return true;
        }
        if (line1.getBase() === line2) {
            return true;
        }
        if (line1.equals(line2.getBase())) {
            return true;
        }
        return line1.getBaseOrSelf() === line2.getBaseOrSelf();
    },

    linesMatchAngle(ang, line1, line2) {
        if (ang.getLine1().equals(line1) && ang.getLine2().equals(line2)) {
            return true;
        }
        if (ang.getLine1().getBase() === line1 && ang.getLine2().equals(line2)) {
            return true;
        }
        if (ang.getLine1().equals(line1) && ang.getLine2().getBase() === line2) {
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