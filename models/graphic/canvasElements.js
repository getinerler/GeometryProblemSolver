'use strict';

import Dot from '../../models/graphic/dot.js';
import Angle from '../../models/graphic/angle.js';
import Line from '../../models/graphic/line.js';
import Point from '../../models/graphic/point.js';
import Parallel from './parallel.js';
import Equivalence from './equivalence.js';
import AngleSum from '../solve/angleSum.js';
import LineSum from '../solve/lineSum.js';

function CanvasElements() {
    this.dots = [];
    this.lines = [];
    this.circles = [];
    this.angles = [];
    this.intersectionDots = [];
    this._parallels = [];
    this.parallelsTemp = [];
    this.equivalents = [];
    this.dragStartPoint = null;
    this.dragDot = null;
    this.currentDot = new Point(0, 0);
    this.hovered = null
    this.selected = [];
    this.imaginaryLines = [];
}

CanvasElements.prototype = {

    getDragDotObject() {
        if (this._dragDot) {
            return this._dragDot.obj;
        }
        return null;
    },

    addDot(dot) {
        this.dots.push(dot);
    },

    addLine(line) {
        this.lines.push(line);
    },

    addAngle(ang) {
        this.angles.push(ang);
    },

    addIntersectionDot(int) {
        this.intersectionDots.push(int);
    },

    addParallelTemp(temp) {
        this.parallelsTemp.push(temp);
    },

    addEquivalent(equi) {
        this.equivalents.push(equi);
    },

    addImaginaryLine(im) {
        this.imaginaryLines.push(im);
    },

    removeDot(dot) {
        this.dots = this.dots.filter((x) => x !== dot);
        this.lines = this.lines.filter((x) => !x.isLineEnd(dot));
        this.angles = this.angles.filter((x) => x.getDot() !== dot);
        for (let line of this.lines) {
            for (let seg of line.getSegments()) {
                if (seg.isLineEnd(dot)) {
                    line.removeSegment(seg);
                }
            }
        }
    },

    addLine(line) {
        this.lines.push(line);
    },

    copy() {
        let newElements = new CanvasElements();

        for (let dot of this.dots) {
            newElements.addDot(new Dot(dot.getX(), dot.getY(), dot.getName()));
        }

        for (let line of this.lines) {
            let newDot1 = newElements.dots.find((x) => x.getName() === line.getDot1().getName());
            let newDot2 = newElements.dots.find((x) => x.getName() === line.getDot2().getName());
            let newLine = new Line(newDot1, newDot2, line.getValue());

            for (let seg of line.getSegments()) {
                let newDot1 = newElements.dots
                    .find((x) => x.getName() === seg.getDot1().getName());
                let newDot2 = newElements.dots
                    .find((x) => x.getName() === seg.getDot2().getName());
                let newSeg = new Line(newDot1, newDot2, seg.getValue()).setBase(newLine);
                newLine.addSegment(newSeg);
            }
            newElements.addLine(newLine);
        }

        //Base lines
        for (let dot of this.dots) {
            if (!dot.getBaseLine()) {
                continue;
            }
            let newDot = newElements.dots.find((x) => x.getName() === dot.getName());
            let baseLine = findLine(newElements, dot.getBaseLine().getName());
            newDot.setBaseLine(baseLine);
        }

        //Intersection lines
        for (let dot of this.dots) {
            if (dot.getIntersectionLines().length === 0) {
                continue;
            }
            let newDot = newElements.dots.find((x) => x.getName() === dot.getName());
            for (let intr of dot.getIntersectionLines()) {
                let l2 = findLine(newElements, intr.getName());
                newDot.addIntersectionLine(l2);
            }
        }

        //Dot base lines
        for (let dot of this.dots) {
            if (dot.getBaseLine()) {
                let newDot = newElements.dots.find((x) => x.getName() === dot.getName());
                let baseLine = findLine(newElements, dot.getBaseLine().getName());
                newDot.setBaseLine(baseLine);
            }
        }

        for (let ang of this.angles) {
            let newDot = newElements.dots.find((x) => x.getName() === ang.getDot().getName());
            let newLine1 = findLine(newElements, ang.getLine1().getName());
            let newLine2 = findLine(newElements, ang.getLine2().getName());

            let newAng = new Angle(newDot, newLine1, newLine2)
                .setValue(ang.getValue())
                .setCanvasAngle(ang.getCanvasAngle());
            newElements.addAngle(newAng);
        }

        for (let parallel of this._parallels) {
            let newParallel = new Parallel();
            for (let el of parallel.getLines()) {
                let newLine = newElements.lines.find((x) => x.getName() === el.getName());
                newParallel.add(newLine);
            }
            newElements._parallels.push(newParallel);
        }

        //Equivalents
        for (let equi of this.equivalents) {
            if (equi.getType() === "LineSum") {
                let newEquiElements = equi.getElements().map(function (x) {
                    return new LineSum(
                        x.getLines().map((y) =>
                            newElements.lines.find((z) => z.getName() === y.getName())));
                });
                newElements.addEquivalent(new Equivalence(newEquiElements));
            }
            if (equi.getType() === "AngleSum") {
                let newEquiElements = equi.getElements().map(function (x) {
                    return new AngleSum(
                        x.getAngles().map((y) =>
                            newElements.angles.find((z) => z.getName() === y.getName())));
                });
                newElements.addEquivalent(new Equivalence(newEquiElements));
            }
        }

        return newElements;


        function findLine(elements, name) {
            for (let line of elements.lines) {
                if (line.getName() === name) {
                    return line;
                }
                for (let seg of line.getSegments()) {
                    if (seg.getName() === name) {
                        return seg;
                    }
                }
            }
        }
    },

    reset() {
        this.dots = [];
        this.lines = [];
        this.circles = [];
        this.angles = [];
        this.intersectionDots = [];
        this.parallelsTemp = [];
        this._parallels = [];
        this.dragStartPoint = null;
        this.dragDot = null;
        this.currentDot = new Point(0, 0);
        this.hovered = null;
        this.selected = [];
    },

    showDetailed() {
        console.log('dots: ' + this.dots
            .map(function (x) {
                return x.getName() +
                    (x.getBaseLine() ?
                        '(baseLine:' + x.getBaseLine().toString() + '?' : '');
            })
            .join(','));

        console.log('lines: ' + this.lines
            .map(function (x) {
                return x.getName() +
                    '(d1: ' + x.getDot1().toString() +
                    ', d2: ' + x.getDot2().toString() +
                    (x.getBase() ? ' , base:' + x.getBase().toString() : '')
                    + ')';
            })
            .join(','));


        for (let line of this.lines) {
            for (let seg of line.getSegments()) {
                console.log(seg.toString());
                console.log('seg: ' +
                    seg.getDot1().toString() + seg.getDot2().toString());
            }
        }

        console.log('angles: ' + this.angles
            .map(function (x) {
                return x.getName() +
                    '(d: ' + x.getDot().toString() +
                    '(l1: ' + x.getLine1().toString() +
                    ', l2: ' + x.getLine2().toString() + ')'
                    + (x.isKnown() ? ' = ' + x.getValue() : '')
                    ;
            })
            .join(','));

        console.log('......................');
    }
}

export default CanvasElements;