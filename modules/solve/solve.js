'use strict';

import Equation from '../../models/equations/equation.js';
import Value from '../../models/equations/value.js';
import Variable from '../../models/equations/variable.js';
import VariableValue from '../../models/equations/variableValue.js';
import Term from '../../models/equations/term.js';
import { getAllLines, getNarrowAngle, areEquivalent } from '../../modules/solve/solveCommon.js';
import { linesMatchAngle, getOrderedAngleSum } from '../../modules/solve/solveCommon.js';
import PolygonFinder from '../../modules/solve/polygonFinder.js';
import SimilarityFinder from '../../modules/solve/similarityFinder.js';
import Calculator from '../../modules/equations/calculator.js';
import { getLineAngle, getAngleDegree, dotBetweenLineSegment } from '../graphic/geoHelper.js';
import EquationTreeCreator from './equationTreeCreator.js';
import Equivalence from '../../models/graphic/equivalence.js';
import Creations from '../equations/creations.js';
import Line from '../../models/graphic/line.js';
import LineSum from '../../models/solve/lineSum.js';
import AngleSum from '../../models/solve/angleSum.js';

function Solve(question) {
    this.question = question;
    this.dots = question.dots;
    this.lines = getAllLines(question.lines);
    this.angles = question.angles;
    this.angleNames = this.getAngleAlternativeNames();
    this.parallels = question.parallels;
    this.equivalents = question.equivalents;
    this.unknown = question.question.getValueName();
    this.triangles = [];
    this.rectangles = [];
    this.variables = [];
    this.equations = [];
    this.rightTriangles = [];
    this.similarTriangles = [];
    this.generation = 1;
}

Solve.prototype = {

    solve() {
        //   try {
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

        // for (let tri of this.triangles) {
        //     console.log(tri.toString() + 
        //     ", lines " + tri.getLines().map((x) => x.toString()) + 
        //     ", angles " + tri.getAngles().map((x) => x.toString()));
        // }

        this.findTriangleCevians();
        this.findRightTriangles();

        this.checkLinesSegmentLengths();
        this.checkDots360();
        this.checkReverseAngles();
        this.checkSupplementaryAngles();
        this.checkCorrespondingAngles();
        this.checkTriangles180();
        this.checkTrianglesEquivalents();
        this.checkPythagoreanTheorems();
        this.checkIsoscelesTriangles();
        this.checkGeometricMeanTheorems();
        this.checkAngleBisectorTheorems();
        this.checkAppolloniusTheorems();
        this.checkRectangles360();

        let similarityFinder = new SimilarityFinder(this.triangles, this.equivalents);
        this.similarTriangles = similarityFinder.find();
        this.checkTriangleSimilarities();

        let calc = new Calculator(
            this.equations,
            this.unknown,
            this.angleNames,
            this.variables,
            this.generation++);

        let whileCounter = 0;
        let solved;
        while (whileCounter++ < 10) {
            solved = calc.solve();
            if (solved.solved) {
                break;
            }
            if (solved.founds.length === 0 && solved.equivalents.length === 0) {
                break;
            }

            for (let found of solved.founds) {
                for (let line of this.lines) {
                    if (line.getValueName() === found.name) {
                        if (line.getLines().length === 1) {
                            line.getLines()[0].setValue(found.value);
                            line.getLines()[0].setValueGeneration(this.generation);
                        }
                    }
                }
                for (let angle of this.angles) {
                    if (angle.getValueName() === found.name) {
                        angle.setValue(found.value);
                        angle.setValueGeneration(this.generation);
                    }
                }
            }

            let equivalents = this.getEquivalentList(solved.equivalents);
            for (let eq of equivalents) {
                let found = false;
                for (let eq2 of this.equivalents) {
                    if (eq.some((x) => eq2.getElements().indexOf(x) > -1)) {
                        found = true;
                        for (let el of eq) {
                            if (!eq2.contains(el)) {
                                eq2.add(el);
                            }
                        }
                    }
                }
                if (!found) {
                    this.equivalents.push(new Equivalence(eq));
                }
            }

            let similarityFinder = new SimilarityFinder(this.triangles, this.equivalents);
            this.similarTriangles = similarityFinder.find();
            this.checkTriangleSimilarities();
        }

        if (solved.solved) {
            let treeCreator = new EquationTreeCreator(this.equations);
            let tree = treeCreator.createTree();

            let response = {
                'solved': true,
                'tree': tree,
                'equations': solved.equations,
                'triangles': this.triangles,
                'rectangles': this.rectangles,
                'similars': this.similarTriangles,
                'unknown': solved.name,
                'value': solved.value
            };

            return response;
        }

        return {
            'solved': false,
            'equations': solved.equations,
            'triangles': this.triangles,
            'rectangles': this.rectangles,
            'similars': this.similarTriangles,
            'message': solved.message
        }
    },

    findTriangleCevians() {
        for (let tri of this.triangles) {
            this.findTriangleCevian(tri);
        }
    },

    findRightTriangles() {
        for (let tri of this.triangles) {
            this.findRightTriangle(tri);
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
            }
            if (dot.isIntersectionDot()) {
                this.checkSupplementaryAngleOnIntersection(dot);
            }
        }
    },

    checkLineSegmentLengths(line) {
        if (line.getSegments().length === 0) {
            return;
        }
        let eq = new Equation();
        eq.setCreation(Creations.SegmentSum);
        eq.addRightTerm(this.getTermFromValue(line));
        for (let seg of line.getSegments()) {
            eq.addLeftTerm(this.getTermFromValue(seg));
        }
        this.equations.push(eq);
    },

    checkSupplementaryAngleOnLine(dot) {
        let eq = new Equation();
        eq.setCreation(Creations.Supplementary180);
        for (let ang of this.angles) {
            if (ang.getDot() !== dot) {
                continue;
            }
            //TODO check this again.
            if (Math.floor(ang.getCanvasAngle()) === 180) {
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
            eq.setCreation(Creations.SupplementaryAngles);
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
        for (let tri of this.triangles) {
            this.checkTriangle180(tri);
        }
    },

    checkTrianglesEquivalents() {
        let len = this.triangles.length;
        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len + i; j++) {
                let tri1 = this.triangles[i];
                let tri2 = this.triangles[j % len];
                this.checkTrianglesEquivalent(tri1, tri2);
            }
        }
    },

    checkIsoscelesTriangles() {
        for (let tri of this.triangles) {
            this.checkIsoscelesTriangle(tri);
        }
    },

    checkPythagoreanTheorems() {
        for (let rightTri of this.rightTriangles) {
            this.checkPythagoreanTheorem(rightTri);
        }
    },

    checkGeometricMeanTheorems() {
        for (let rightTri of this.rightTriangles) {
            this.checkGeometricMeanTheorem(rightTri);
        }
    },

    checkAngleBisectorTheorems() {
        for (let tri of this.triangles) {
            this.checkAngleBisectorTheorem(tri);
        }
    },

    checkAppolloniusTheorems() {
        for (let tri of this.triangles) {
            this.checkAppolloniusTheorem(tri);
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
        eq.setCreation(Creations.Round360);
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
            eq.setCreation(Creations.ReverseAngles);
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
            eq.setCreation(Creations.CorrespondingAngles);
            eq.addLeftTerm(this.getTermFromValue(ang1));
            eq.addLeftTerm(this.getTermFromValue(ang2));
            eq.addRightTerm(new Term(180));
            this.equations.push(eq);
        } else {
            let eq = new Equation();
            eq.setCreation(Creations.CorrespondingAngles);
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
        eq.setCreation(Creations.Triangle180);
        eq.addRightTerm(new Term(180));
        for (let angSum of tri.getAngles()) {
            for (let ang of angSum.getAngles()) {
                eq.addLeftTerm(this.getTermFromValue(ang));
            }
        }
        this.equations.push(eq);
    },

    checkTrianglesEquivalent(tri1, tri2) {
        let angs1 = tri1.getAngles();
        let angs2 = tri2.getAngles();
        let rest = [];
        for (let i = 0; i < angs1.length; i++) {
            let ang1 = angs1[i];
            let ang2 = angs2.find((x) => this.areEquivalent(x, ang1));
            if (ang2) {
                rest.push(ang1);
                rest.push(ang2);
            }
        }
        if (rest.length === 2) {
            let found = false;
            let ang1 = rest[0];
            let ang2 = rest[1];
            for (let equi of this.equivalents) {
                if (equi.contains(ang1) || equi.contains(ang2)) {
                    found = true;
                    equi.add(ang1);
                    equi.add(ang2);
                }
            }
            if (!found) {
                this.equivalents.push(new Equivalence(rest));
            }
        }
    },

    checkIsoscelesTriangle(tri) {
        let len = tri.getAngles().length;

        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len + i; j++) {
                let ang1 = tri.getAngles()[i];
                let ang2 = tri.getAngles()[j % len];

                if (!this.areEquivalent(ang1, ang2)) {
                    continue;
                }

                //TODO Why lines should match angle lines?
                let commonLine = ang1.getLine1() === ang2.getLine1() ?
                    ang1.getLine1() :
                    ang1.getLine2();
                let line1 = ang1.getLine1() === commonLine ? ang1.getLine2() : ang1.getLine1();
                let line2 = ang2.getLine1() === commonLine ? ang2.getLine2() : ang2.getLine1();

                let eq = new Equation();
                eq.setCreation(Creations.IsoscelesLines);
                eq.addLeftTerm(this.getTermFromValue(line1));
                eq.addRightTerm(this.getTermFromValue(line2));
                this.equations.push(eq);
            }
        }

        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len + i; j++) {
                let line1 = tri.getLines()[i];
                let line2 = tri.getLines()[j % len];

                if (!this.areEquivalent(line1, line2)) {
                    continue;
                }

                let commonAng;
                for (let ang of tri.getAngles()) {
                    if (new LineSum(ang.getLine1()).equals(line1) &&
                        new LineSum(ang.getLine2()).equals(line2) ||
                        new LineSum(ang.getLine2()).equals(line1) &&
                        new LineSum(ang.getLine1()).equals(line2)) {
                        commonAng = ang;
                    }
                }

                let otherAngs = tri.getAngles().filter((x) => x !== commonAng);
                let ang1 = otherAngs[0];
                let ang2 = otherAngs[1];

                let eq = new Equation();
                eq.setCreation(Creations.IsoscelesAngles);
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

    checkPythagoreanTheorem(rightTri) {
        let eq = new Equation();
        eq.setCreation(Creations.PythagorianTheorem);
        for (let i = 0; i < 2; i++) {
            eq.addLeftTerm(this.getTermFromValue(rightTri.sideLines[i], 2));
        }
        eq.addRightTerm(this.getTermFromValue(rightTri.hypothenus, 2));
        this.equations.push(eq);
    },

    checkGeometricMeanTheorem(rightTri) {
        let hypothenus = rightTri.hypothenus;

        for (let line of this.lines) {
            if (
                (line.getDot1() === rightTri.ang90.getDot() &&
                    line.getDot2().getBaseLine() &&
                    new LineSum(line.getDot2().getBaseLine()).equals(hypothenus)) ||
                (line.getDot2() === rightTri.ang90.getDot() &&
                    line.getDot1().getBaseLine() &&
                    new LineSum(line.getDot1().getBaseLine()).equals(hypothenus))) {

                let eq = new Equation();
                eq.setCreation(Creations.GeometricMeanTheorem);
                eq.addLeftTerm(this.getTermFromValue(line, 2));

                let otherDot = line.getOtherDot(rightTri.ang90.getDot());
                let l1 = this.lines
                    .find((x) => x.isLineEnd(otherDot) && x.isLineEnd(hypothenus.getDot1()));
                let l2 = this.lines
                    .find((x) => x.isLineEnd(otherDot) && x.isLineEnd(hypothenus.getDot2()));

                let term1 = this.getTermFromValue(l1);
                let term2 = this.getTermFromValue(l2);
                eq.addRightTerm(term1.multiply(term2));
                this.equations.push(eq);
            }
        }
    },

    checkAngleBisectorTheorem(tri) {
        for (let i = 0; i < tri.getAngles().length; i++) {
            let ang = tri.getAngle(i);
            let otherTriangleLine = tri.getLine((i + 2) % 3);
            let otherLines = this.lines
                .filter((x) =>
                    x.isLineEnd(ang.getDot()) &&
                    x.getBaseOrSelf() !== ang.getLine1().getBaseOrSelf() &&
                    x.getBaseOrSelf() !== ang.getLine2().getBaseOrSelf() &&
                    otherTriangleLine
                        .equals(new LineSum(x.getOtherDot(ang.getDot()).getBaseLine())));
            if (otherLines.length === 0) {
                continue;
            }

            let line1 = new LineSum(ang.getLine1());
            let line2 = new LineSum(ang.getLine2());
            for (let otherLine of otherLines) {
                let ang1A = new AngleSum(getOrderedAngleSum(this.angles, line1, otherLine));
                let ang1B = new AngleSum(getOrderedAngleSum(this.angles, otherLine, line1));
                let ang2A = new AngleSum(getOrderedAngleSum(this.angles, line2, otherLine));
                let ang2B = new AngleSum(getOrderedAngleSum(this.angles, otherLine, line2));
                let ang1 = getAngleDegree(ang1A) > getAngleDegree(ang1B) ? ang1B : ang1A;
                let ang2 = getAngleDegree(ang2A) > getAngleDegree(ang2B) ? ang2B : ang2A;
                if (!this.areEquivalent(ang1, ang2)) {
                    continue;
                }

                let otherDot = otherLine.getOtherDot(ang.getDot());
                let seg1 = this.getSegmentChains(otherDot, otherTriangleLine.getDot1());
                let seg2 = this.getSegmentChains(otherDot, otherTriangleLine.getDot2());

                let triangleLine2 = tri.getLine(i % 3);
                let triangleLine1 = tri.getLine((i + 1) % 3);

                let eq = new Equation();
                eq.setCreation(Creations.AngleBisector);

                let termLine1a = this.getTermFromValue(triangleLine1);
                //TODO several segmented scenarios
                let termLine2a = this.getTermFromValue(new LineSum(seg1[0]), -1);
                let termLine1b = this.getTermFromValue(triangleLine2);
                let termLine2b = this.getTermFromValue(new LineSum(seg2[0]), -1);
                eq.addLeftTerm(termLine1a.multiply(termLine2a));
                eq.addRightTerm(termLine1b.multiply(termLine2b));
                this.equations.push(eq);
            }
        }
    },

    checkAppolloniusTheorem(tri) {
        for (let cev of tri.getCevians()) {
            if (!cev.isMean) {
                continue;
            }

            let eq = new Equation();
            eq.setCreation(Creations.ApolloniusTheorem);
            eq.addLeftTerm(this.getTermFromValue(cev.angle.getLine1(), 2));
            eq.addLeftTerm(this.getTermFromValue(cev.angle.getLine2(), 2));

            let term1 = this.getTermFromValue(cev.line, 2).multiply(new Term(new Value(2, -1)));
            let term2 = this.getTermFromValue(cev.cevian, 2).multiply(new Term(new Value(2)));
            eq.addRightTerm(term1);
            eq.addRightTerm(term2);
            this.equations.push(eq);
        }
    },

    checkTriangleSimilarities() {
        for (let sim of this.similarTriangles) {
            for (let i = 0; i < 3; i++) {
                //Angles
                let angSum1 = sim.getAngles1()[i];
                let angSum2 = sim.getAngles2()[i];
                if (angSum1.isKnown() && angSum2.isKnown()) {
                    continue;
                }
                let eq = new Equation();
                eq.setCreation(Creations.SimilarAngles, true);
                eq.setCreationText(Creations.SimilarAngles.getExplanation(sim));
                for (let ang of angSum1.getAngles()) {
                    eq.addLeftTerm(this.getTermFromValue(ang));
                }
                for (let ang of angSum2.getAngles()) {
                    eq.addRightTerm(this.getTermFromValue(ang));
                }
                this.equations.push(eq);
            }

            for (let i = 0; i < 3; i++) {
                //Lines
                let line1a = sim.getLines1()[i];
                let line2a = sim.getLines2()[i];
                let line1b = sim.getLines1()[(i + 1) % 3];
                let line2b = sim.getLines2()[(i + 1) % 3];

                let eq = new Equation();
                eq.setCreation(Creations.SimilarLines, true);
                eq.setCreationText(Creations.SimilarLines.getExplanation(sim));
                let termLine1a = this.getTermFromValue(line1a);
                let termLine2a = this.getTermFromValue(line2a, -1);
                let termLine1b = this.getTermFromValue(line1b);
                let termLine2b = this.getTermFromValue(line2b, -1);

                eq.addLeftTerm(termLine1a.multiply(termLine2a));
                eq.addRightTerm(termLine1b.multiply(termLine2b));

                this.equations.push(eq);
            }
        }
    },

    checkRectangle360(rect) {
        let eq = new Equation();
        eq.setCreation(Creations.Rectangle360);
        eq.addRightTerm(new Term(360));
        for (let angSum of rect.getAngles()) {
            for (let ang of angSum.getAngles()) {
                eq.addLeftTerm(this.getTermFromValue(ang));
            }
        }
        this.equations.push(eq);
    },

    findTriangleCevian(tri) {
        for (let i = 0; i < tri.getAngles().length; i++) {
            let ang = tri.getAngle(i);
            let triLine = tri.getLine((i + 2) % 3);
            let cevians = this.lines.filter(function (x) {
                if (tri.getLines().some((y) => y.getBaseOrSelf() === x.getBaseOrSelf())) {
                    return false;
                }
                if (!x.isLineEnd(ang.getDot())) {
                    return false;
                }
                let otherDot = x.getOtherDot(ang.getDot());
                if (!otherDot) {
                    return false;
                }
                let baseLine = otherDot.getBaseLine();
                if (!baseLine) {
                    return false;
                }
                if (otherDot.getBaseLine().getBaseOrSelf() !== triLine.getBaseOrSelf()) {
                    return false;
                }
                return true;
            });
            if (cevians.length === 0) {
                continue;
            }

            for (let cev of cevians) {
                let dot1 = ang.getDot();
                let dot2 = cev.getOtherDot(dot1);
                let triCev = {
                    dot1,
                    dot2,
                    angle: ang,
                    line: triLine,
                    cevian: cev
                };

                let seg1 = this.getSegmentChains(dot2, triLine.getDot1());
                let seg2 = this.getSegmentChains(dot2, triLine.getDot2());

                triCev.isMean = this.areEquivalent(new LineSum(seg1), new LineSum(seg2));
                tri.addCevian(triCev);
            }
        }
    },

    findRightTriangle(tri) {
        let index90 = -1;
        for (let i = 0; i < 3; i++) {
            let ang = tri.getAngles()[i];
            if (ang.valueEqual(90)) {
                index90 = i;
            }
        }
        if (index90 === -1) {
            return;
        }
        let sideLines = [tri.getLines()[index90], tri.getLines()[(index90 + 1) % 3]];
        let hypothenus = tri.getLines().find((x) => sideLines.indexOf(x) === -1);

        let ang90 = tri.getAngle(index90);
        let sideAngles = tri.getAngles().filter((x) => x !== ang90);

        let rightTri = {
            triangle: tri,
            hypothenus,
            sideLines,
            ang90,
            sideAngles
        };
        this.rightTriangles.push(rightTri);
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
        let var1;
        let oldVar = this.variables.find((x) => x.getName() === val.getValueName());
        if (oldVar) {
            var1 = oldVar;
        } else {
            var1 = new Variable(val.getValueName());
            this.variables.push(var1);
        }
        let term = new Term(null, new VariableValue(var1, pow));
        return term;
    },

    linesParallel(line1, line2) {
        let base1 = line1.getBaseOrSelf();
        let base2 = line2.getBaseOrSelf();
        let par = this.parallels.find((x) => x.contains(base1) && x.contains(base2));
        return !!par;
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

    getSegmentChains(dot1, dot2) {
        let lastDot = null;
        let tempDot = dot1;
        let tempLine = null;
        let lines = [];
        let safeCounter = 0;
        while (tempDot !== dot2 && tempDot !== lastDot && safeCounter++ < 100) {
            lastDot = tempDot;
            if (tempLine === null) {
                let l1 = this.lines
                    .filter((x) => x.isLineEnd(dot1) && x.getLines().length === 1)
                    .map((x) => x.getLines()[0]);
                for (let l of l1) {
                    if (!dotBetweenLineSegment(l.getOtherDot(dot1), new Line(dot1, dot2))) {
                        continue;
                    }
                    tempLine = l;
                    tempDot = l.getOtherDot(dot1);
                    lines.push(l);
                }
                if (tempLine === null) {
                    throw 'Solve.getSegmentChains: Can\'t find first segment';
                }
            } else {
                let l1 = this.lines
                    .find((x) => x.isLineEnd(tempDot) && x !== tempLine && x.getLines().length === 1)
                    .getLines()[0];
                tempLine = l1;
                lines.push(l1);
                tempDot = l1.getOtherDot(tempDot);
            }
        }
        return lines;
    },

    calculateAngleDegrees() {
        for (let ang of this.question.angles) {
            ang.setCanvasAngle(getAngleDegree(ang));
        }
    },

    areEquivalent(val1, val2) {
        return areEquivalent(this.equivalents, val1, val2);
    },

    getEquivalentList(eqs) {

        let newList = [];
        for (let eq of eqs) {
            let list = [];
            for (let el of eq) {
                for (let line of this.lines) {
                    if (el.getName() === line.getValueName()) {
                        el = line;
                    }
                }
                for (let ang of this.angles) {
                    if (el.getName() === ang.getValueName()) {
                        el = ang;
                    }
                }
                if (!el) {
                    throw 'Solve.solveProblem: Equivalent cannot be found.';
                }
                list.push(el);
            }
            newList.push(list);
        }

        return newList;
    }
}

export default Solve;