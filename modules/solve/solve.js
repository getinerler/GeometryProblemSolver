'use strict';

import Equation from '../../models/equations/equation.js';
import Value from '../../models/equations/value.js';
import Variable from '../../models/equations/variable.js';
import VariableValue from '../../models/equations/variableValue.js';
import Term from '../../models/equations/term.js';
import { getAllLines, getNarrowAngle } from '../../modules/solve/solveCommon.js';
import { linesMatchAngle } from '../../modules/solve/solveCommon.js';
import PolygonFinder from '../../modules/solve/polygonFinder.js';
import SimilarityFinder from '../../modules/solve/similarityFinder.js';
import Calculator from '../../modules/equations/calculator.js';
import { getLineAngle, getAngleDegree } from '../graphic/geoHelper.js';
import EquationTreeCreator from './equationTreeCreator.js';

function Solve(question) {
    this.question = question;
    this.dots = question.dots;
    this.lines = getAllLines(question.lines);
    this.angles = question.angles;
    this.angleNames = this.getAngleAlternativeNames();
    this.parallels = question.parallels;
    this.unknown = question.question.getValueName();
    this.triangles = [];
    this.rectangles = [];
    this.variables = [];
    this.equations = [];
    this.similarTriangles = [];
}

Solve.prototype = {

    solve() {
        // try {
        window.equationCounter = 1;
        return this.solveProblem();
        // } catch (e) {
        //     return {
        //         'solved': false,
        //         'equations': this.equations,
        //         'message': e
        //     };
        // }
    },

    solveProblem() {
        if (!this.unknown.length === 0) {
            return {
                'solved': false,
                'equations': this.equations,
                'message': 'There is no question.'
            }
        }

        this.calculateAngleDegrees();

        let polygonFinder = new PolygonFinder(this.question);
        let polygons = polygonFinder.findPolygons();

        this.triangles = polygons.triangles;
        this.rectangles = polygons.rectangles;

        this.checkLinesSegmentLengths();
        this.checkDots360();
        this.checkReverseAngles();
        this.checkSupplementaryAngles();
        this.checkCorrespondingAngles();
        this.checkTriangles180();
        this.checkIsoscelesTriangles();
        this.checkPythagoreanTheorems();
        this.checkRectangles360();

        let similarityFinder = new SimilarityFinder(this.triangles);
        this.similarTriangles = similarityFinder.find();
        this.checkTriangleSimilarities();

        let calc = new Calculator(
            this.equations,
            this.unknown,
            this.angleNames,
            this.variables);

        let solved = calc.solve();
        if (solved.solved) {
            let treeCreator = new EquationTreeCreator(this.equations);
            let tree = treeCreator.createTree();
            console.log(JSON.stringify(tree));
            return {
                'solved': true,
                'equations': solved.equations,
                'unknown': solved.name,
                'value': solved.value
            };
        }

        return {
            'solved': false,
            'equations': solved.equations,
            'message': solved.message
        }
    },

    checkLinesSegmentLengths() {
        for (let line of this.lines) {
            this.checkLineSegmentLengths(line);
        }
    },

    checkDots360() {
        for (let dot of this.dots) {
            this.checkDot360(dot);
        }
    },

    checkReverseAngles() {
        for (let dot of this.dots) {
            if (dot.isOnLine() || !dot.isIntersectionDot()) {
                continue;
            }
            this.checkReverseAngle(dot);
        }
    },

    checkSupplementaryAngles() {
        for (let dot of this.dots) {
            if (dot.isOnLine()) {
                this.checkSupplementaryAngleOnLine(dot);
            } else if (dot.isIntersectionDot()) {
                this.checkSupplementaryAngleOnIntersection(dot);
            }
        }
    },

    checkLineSegmentLengths(line) {
        if (line.getSegments().length === 0) {
            return;
        }
        let eq = new Equation();
        eq.setCreation('Segment\'s length sum equal to line length.');
        eq.addRightTerm(this.getTermFromValue(line));
        for (let seg of line.getSegments()) {
            eq.addLeftTerm(this.getTermFromValue(seg));
        }
        this.equations.push(eq);
    },

    checkSupplementaryAngleOnLine(dot) {
        let eq = new Equation();
        eq.setCreation('Supplementary angles equal to 180.');
        for (let ang of this.angles) {
            if (ang.getDot() !== dot) {
                continue;
            }
            if (ang.getCanvasAngle() === 180) {
                continue;
            }
            eq.addLeftTerm(this.getTermFromValue(ang));
        }
        eq.addRightTerm(new Term(180));
        this.equations.push(eq);
    },

    checkSupplementaryAngleOnIntersection(dot) {
        let angles = this.angles
            .filter((x) => x.getDot() === dot)
            .sort(function (ang1, ang2) {
                let deg1 = getLineAngle(ang1.getLine1(), ang1.getDot());
                let deg2 = getLineAngle(ang2.getLine1(), ang2.getDot());
                return deg1 > deg2;
            });

        for (let i = 0; i < angles.length; i++) {
            let ang1 = angles[i];
            let base = ang1.getLine1().getBase();
            if (base === null) {
                continue;
            }
            let arr = findArrayTillNextLineSegment(i, angles, base);
            arr.unshift(ang1);

            let eq = new Equation();
            eq.setCreation('Supplementary angles.');
            for (let ang of arr) {
                eq.addLeftTerm(this.getTermFromValue(ang));
            }
            eq.addRightTerm(new Term(180));
            this.equations.push(eq);
        }

        function findArrayTillNextLineSegment(i, angles, base) {
            let anglesTemp = [];
            for (let j = i + 1; j < angles.length + i; j++) {
                let ang2 = angles[j % angles.length];
                if (ang2.getLine1().getBase() === base) {
                    return anglesTemp;
                }
                anglesTemp.push(ang2);
            }
        }
    },

    checkCorrespondingAngles() {
        for (let line1 of this.lines) {
            for (let line2 of this.lines) {
                if (line1.getBaseOrSelf() === line2.getBaseOrSelf()) {
                    continue;
                }
                if (!this.linesParallel(line1, line2)) {
                    continue;
                }
                for (let line3 of this.lines) {
                    if (line1.getBaseOrSelf() === line3.getBaseOrSelf()) {
                        continue;
                    }
                    if (line2.getBaseOrSelf() === line3.getBaseOrSelf()) {
                        continue;
                    }
                    if (!line1.isConnected(line3) || !line2.isConnected(line3)) {
                        continue;
                    }
                    this.checkCorrespondingAngle(line1, line2, line3);
                }
            }
        }
    },

    checkTriangles180() {
        for (let triangle of this.triangles) {
            this.checkTriangle180(triangle);
        }
    },

    checkIsoscelesTriangles() {
        for (let triangle of this.triangles) {
            this.checkIsoscelesTriangle(triangle);
        }
    },

    checkPythagoreanTheorems() {
        for (let triangle of this.triangles) {
            this.checkPythagoreanTheorem(triangle);
        }
    },

    checkRectangles360() {
        for (let rect of this.rectangles) {
            this.checkRectangle360(rect);
        }
    },

    checkDot360(dot) {
        let dotAngles = this.angles.filter((x) => x.getDot() === dot);
        if (dotAngles.length === 0) {
            return null;
        }
        let eq = new Equation();
        eq.setCreation('Round angle equals to 360.');
        eq.addRightTerm(new Term(360));
        for (let angle of dotAngles) {
            eq.addLeftTerm(this.getTermFromValue(angle));
        }
        this.equations.push(eq);
    },

    checkReverseAngle(dot) {
        let angles = this.angles
            .filter((x) => x.getDot() === dot)
            .sort(function (ang1, ang2) {
                let deg1 = getLineAngle(ang1.getLine1(), ang1.getDot());
                let deg2 = getLineAngle(ang2.getLine1(), ang2.getDot());
                return deg1 > deg2;
            });

        let halfLength = angles.length / 2;
        for (let i = 0; i < halfLength; i++) {
            let ang1 = angles[i];
            let ang2 = angles[i + halfLength];

            let eq = new Equation();
            eq.setCreation('Reverse angles.');
            eq.addLeftTerm(this.getTermFromValue(ang1));
            eq.addRightTerm(this.getTermFromValue(ang2));

            this.equations.push(eq);
        }
    },

    checkCorrespondingAngle(line1, line2, line3) {
        let ang1 = this.getNarrowAngle(line1, line3);
        let ang2 = this.getNarrowAngle(line2, line3);
        let deg1 = getAngleDegree(ang1);
        let deg2 = getAngleDegree(ang2);

        if (Math.abs(deg1 - deg2) > 30) {
            let eq = new Equation();
            eq.setCreation('Corresponding angles.');
            eq.addLeftTerm(this.getTermFromValue(ang1));
            eq.addLeftTerm(this.getTermFromValue(ang2));
            eq.addRightTerm(new Term(180));
            this.equations.push(eq);
        } else {
            let eq = new Equation();
            eq.setCreation('Corresponding angles.');
            eq.addLeftTerm(this.getTermFromValue(ang1));
            eq.addRightTerm(this.getTermFromValue(ang2));
            this.equations.push(eq);
        }
    },

    checkTriangle180(tri) {
        if (tri.getAngles().filter((x) => !x.isKnown()).length === 0) {
            return;
        }
        let eq = new Equation();
        eq.setCreation('Triangle angles equal to 180.');
        eq.addRightTerm(new Term(180));
        for (let angSum of tri.getAngles()) {
            for (let ang of angSum.getAngles()) {
                eq.addLeftTerm(this.getTermFromValue(ang));
            }
        }
        this.equations.push(eq);
    },

    checkIsoscelesTriangle(tri) {
        let len = tri.getAngles().length;
        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len + i; j++) {
                let ang1 = tri.getAngles()[i];
                let ang2 = tri.getAngles()[j % len];
                if (ang1.getValue() === null) {
                    continue;
                }
                if (ang1.getValue() !== ang2.getValue()) {
                    continue;
                }

                let commonLine = ang1.getLine1() === ang2.getLine1() ?
                    ang1.getLine1() :
                    ang1.getLine2();
                let line1 = ang1.getLine1() === commonLine ?
                    ang1.getLine2() :
                    ang1.getLine1();
                let line2 = ang2.getLine1() === commonLine ?
                    ang2.getLine2() :
                    ang2.getLine1();

                let eq = new Equation();
                eq.setCreation('Isosceles triangle lines.');
                eq.addLeftTerm(this.getTermFromValue(line1));
                eq.addRightTerm(this.getTermFromValue(line2));
                this.equations.push(eq);
            }
        }

        let len2 = tri.getLines().length;
        for (let i = 0; i < len2; i++) {
            for (let j = i + 1; j < len2 + i; j++) {
                let line1 = tri.getLines()[i];
                let line2 = tri.getLines()[j % len2];
                if (line1.getValue() === null) {
                    continue;
                }
                if (line1.getValue() !== line2.getValue()) {
                    continue;
                }

                let commonAng;
                for (let ang of tri.getAngles()) {
                    if (ang.getLine1() === line1 && ang.getLine2() === line2 ||
                        ang.getLine2() === line1 && ang.getLine1() === line2) {
                        commonAng = ang;
                    }
                }

                let otherAngs = tri.getAngles().filter((x) => x !== commonAng);
                let ang1 = otherAngs[0];
                let ang2 = otherAngs[1];

                let eq = new Equation();
                eq.setCreation('Isosceles triangle angles.');
                for (let ang of ang1.getAngles()) {
                    eq.addLeftTerm(this.getTermFromValue(ang));
                }
                for (let ang of ang2.getAngles()) {
                    eq.addRightTerm(this.getTermFromValue(ang));
                }
                this.equations.push(eq);
            }
        }
    },

    checkPythagoreanTheorem(tri) {
        let angle90 = tri.getAngles().find((x) => x.valueEqual(90));
        if (!angle90) {
            return;
        }
        let sideLines = [angle90.getLine1(), angle90.getLine2()];
        let hypothenus = tri.getLines().find((x) => sideLines.indexOf(x) === -1);
        if (!hypothenus) {
            return;
        }
        let eq = new Equation();
        eq.setCreation('Pythagorian Theorem.');
        for (let i = 0; i < 2; i++) {
            eq.addLeftTerm(this.getTermFromValue(sideLines[i], 2));
        }
        eq.addRightTerm(this.getTermFromValue(hypothenus, 2));
        this.equations.push(eq);
    },

    checkTriangleSimilarities() {
        for (let sim of this.similarTriangles) {
            for (let i = 0; i < 3; i++) {
                let angSum1 = sim.angles1[i];
                let angSum2 = sim.angles2[i];
                if (angSum1.isKnown() && angSum2.isKnown()) {
                    continue;
                }
                let eq = new Equation();
                eq.setCreation('Similar triangle angles.');
                for (let ang of angSum1.getAngles()) {
                    eq.addLeftTerm(this.getTermFromValue(ang));
                }
                for (let ang of angSum2.getAngles()) {
                    eq.addRightTerm(this.getTermFromValue(ang));
                }
                this.equations.push(eq);
            }
        }
    },

    checkRectangle360(rect) {
        let eq = new Equation();
        eq.setCreation('Rectangle angles equal to 360.');
        eq.addRightTerm(new Term(360));
        for (let angSum of rect.getAngles()) {
            for (let ang of angSum.getAngles()) {
                eq.addLeftTerm(this.getTermFromValue(ang));
            }
        }
        this.equations.push(eq);
    },

    getTriangleLine(tri, line) {
        let base = line.getBaseOrSelf();
        for (let line of tri.getLines()) {
            if (line === base) {
                return base;
            }
            for (let seg of line.getSegments()) {
                if (seg === line) {
                    return seg;
                }
            }
        }
        return null;
    },

    getNarrowAngle(line1, line2) {
        return getNarrowAngle(this.angles, line1, line2);
    },

    getLineAngle(tri, line1, line2) {
        for (let ang of tri.getAngles()) {
            if (linesMatchAngle(ang, line1, line2)) {
                return ang;
            }
        }
        return null;
    },

    getTermFromValue(val, pow) {
        pow = pow || 1;
        if (val.isKnown()) {
            return new Term(new Value(val.getValue(), pow));
        }
        let var1 = new Variable(val.getValueName());
        let term = new Term(null, new VariableValue(var1, pow));
        this.variables.push(var1);
        return term;
    },

    linesParallel(line1, line2) {
        let base1 = line1.getBaseOrSelf();
        let base2 = line2.getBaseOrSelf();
        let par = this.parallels.find((x) => x.contains(base1) && x.contains(base2));
        if (par) {
            return true;
        } else {
            return false;
        }
    },

    getAngleAlternativeNames() {
        let namesArray = [];
        for (let ang of this.angles) {
            let dot = ang.getDot();
            let line1s = [ang.getLine1().getBaseOrSelf()];
            let line2s = [ang.getLine2().getBaseOrSelf()];
            let names = [];
            for (let seg of line1s[0].getSegments()) {
                if (seg.isLineEnd(dot)) {
                    line1s.push(seg);
                }
            }
            for (let seg of line2s[0].getSegments()) {
                if (seg.isLineEnd(dot)) {
                    line2s.push(seg);
                }
            }
            for (let l1 of line1s) {
                for (let l2 of line2s) {
                    names.push(
                        'm(' + l1.getOtherDot(dot).getName() +
                        dot.getName() +
                        l2.getOtherDot(dot).getName() + ')');
                }
            }
            if (names.length > 0) {
                namesArray.push(names);
            }
        }
        return namesArray;
    },

    calculateAngleDegrees() {
        for (let ang of this.question.angles) {
            ang.setCanvasAngle(getAngleDegree(ang));
        }
    }
}

export default Solve;