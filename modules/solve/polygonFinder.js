'use strict';

import { getAllLines, linesMatchAngle } from '../../modules/solve/solveCommon.js';
import Triangle from '../../models/solve/triangle.js';
import Rectangle from '../../models/solve/rectangle.js';
import AngleSum from '../../models/solve/angleSum.js';

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
                this.createTriangle(line1, line2, line3);
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

    createTriangle(line1, line2, line3) {
        let dot1 = this.getLinesCommonDot(line1, line2);
        let dot2 = this.getLinesCommonDot(line2, line3);
        let dot3 = this.getLinesCommonDot(line3, line1);

        let ang1 = this.getNarrowAngle(line1, line2);
        let ang2 = this.getNarrowAngle(line2, line3);
        let ang3 = this.getNarrowAngle(line3, line1);

        let dots = [dot1, dot2, dot3];
        let lines = [line1, line2, line3];
        let angles = [new AngleSum(ang1), new AngleSum(ang2), new AngleSum(ang3)];
        let tri = new Triangle(dots, lines, angles);

        let old = this.triangles.find(function (x) {
            if (x.getLines().indexOf(line1) === -1) {
                return false;
            } else if (x.getLines().indexOf(line2) === -1) {
                return false;
            } else if (x.getLines().indexOf(line3) === -1) {
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

        let ang1 = this.getNarrowAngle(line1, line2);
        let ang2 = this.getNarrowAngle(line2, line3);
        let ang3 = this.getNarrowAngle(line3, line4);
        let ang4 = this.getNarrowAngle(line4, line1);

        let dots = [dot1, dot2, dot3, dot4];
        let lines = [line1, line2, line3, line4];
        let angles = [
            new AngleSum(ang1),
            new AngleSum(ang2),
            new AngleSum(ang3),
            new AngleSum(ang4)
        ];
        let rect = new Rectangle(dots, lines, angles);

        let old = this.rectangles.find(function (x) {
            if (x.getLines().indexOf(line1) === -1) {
                return false;
            } else if (x.getLines().indexOf(line2) === -1) {
                return false;
            } else if (x.getLines().indexOf(line3) === -1) {
                return false;
            } else if (x.getLines().indexOf(line4) === -1) {
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

    getNarrowAngle(line1, line2) {
        let ang1 = this.getNarrowAngleWithLines(line1, line2);
        if (ang1) {
            return ang1;
        }
        let base1 = line1.getBase();
        let base2 = line2.getBase();
        if (base1 && base2) {
            return this.getNarrowAngleWithLines(base1, base2);
        }
    },

    getNarrowAngleWithLines(line1, line2) {
        for (let ang of this.angles) {
            if (this.linesMatchAngle(ang, line1, line2)) {
                if (ang.getCanvasAngle() < 180) {
                    return ang;
                }
            }
        }
        return null;
    },

    linesMatchAngle(ang, line1, line2) {
        return linesMatchAngle(ang, line1, line2);
    }
}

export default PolygonFinder;