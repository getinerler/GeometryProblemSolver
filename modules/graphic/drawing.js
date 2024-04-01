'use strict';

import Canvas from '../graphic/canvas.js';
import CanvasElements from '../../models/graphic/canvasElements.js';
import { dotOnLine, dotsCloser, anglesCloser, dotBetweenAngle } from './geoHelper.js';
import { dotOnLineSegment, getLineAngle, lineIntersect } from './geoHelper.js';
import { getDotsLineRatio, getDotOnLineWithRatio, getAngleDegree } from './geoHelper.js';
import { getQuestionText } from './texts.js';
import LineState from './buttonStates/lineState.js';
import EquivalenceState from './buttonStates/equivalenceState.js';
import { resetNames } from './names.js';
import Dot from '../../models/graphic/dot.js';
import Line from '../../models/graphic/line.js';
import Angle from '../../models/graphic/angle.js';
import TriangleState from './buttonStates/triangleState.js';
import RectangleState from './buttonStates/rectangleState.js';
import SquareState from './buttonStates/squareState.js';
import ParallelMediator from './parallelMediator.js';

function Drawing() {
    this._canvas = null;
    this._valueObject = null;
    this._question = null;
    this._parallels = [];
    this._elements = new CanvasElements();
    this._parallelMediator = new ParallelMediator(this, this._elements);
    this._buttonState = null;
    this._newLine = null;
    this._mouseIsDown = false;
}

Drawing.prototype = {

    bind(canvas) {
        let self = this;
        self._canvas = new Canvas(canvas, this._elements);
        self.setButtonState('line');

        canvas.addEventListener('mousemove', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self._elements.currentDot.update(x, y);
            self.updateHovered();
            self._buttonState.mouseMoveEvent(x, y);
            self._parallelMediator.mouseMoveEvent();
            if (self._mouseIsDown) {
                self.updateSelected();
            }
            self._canvas.update();
        });

        canvas.addEventListener('mousedown', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self._mouseIsDown = true;

            self._elements.currentDot.update(x, y);
            self.updateHovered();
            self.deselectAll();
            self.updateSelected(true);
            self._buttonState.mouseDownEvent(x, y);
            self._parallelMediator.mouseDownEvent();
            self._canvas.update();
        });

        canvas.addEventListener('mouseup', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self._mouseIsDown = false;

            self._elements.currentDot.update(x, y);
            self.updateHovered();
            self.updateSelected();
            self._buttonState.mouseUpEvent(x, y);
            self._parallelMediator.mouseUpEvent(self._newLine);
            self._canvas.update();
            self.updateQuestionText();
            if (self._elements.selected.length === 0) {
                self.deactivateInput();
            }
        });
        return this;
    },

    createDot(x, y) {
        let dot;
        let hovered = this._elements.hovered;
        if (hovered && hovered.type === 'dot') {
            dot = hovered.obj;
        } else {
            dot = new Dot(x, y);
            this._elements.addDot(dot);
        }
        return dot;
    },

    createNewLine(dot1, dot2) {
        let line = new Line(dot1, dot2);
        this._newLine = line;
        this._elements.addLine(line);

        if (this._elements.hovered) {
            let hovered = this._elements.hovered;
            if (hovered.type === 'dot' && hovered.obj.isOnLine()) {
                hovered.obj.addIntersectionLine(line);
            }
            if (hovered.type === 'line') {
                this.handleDotOnLine(hovered.obj, dot2);
            }
        }
        this.handleIntersectionDots(line);
        this.arrangeAngles(dot2);
    },

    createSegmentLines(targetLine, dot) {
        let oneOfOtherLines = dot.getIntersectionLines()
            .find(function (x) {
                return x !== targetLine;
            })
        if (oneOfOtherLines.isSegment()) {
            oneOfOtherLines = oneOfOtherLines.getBase();
        }

        for (let seg of targetLine.getSegments()) {
            let intrDot = lineIntersect(oneOfOtherLines, seg);
            if (!intrDot) {
                continue;
            }
            if (dotsCloser(intrDot, seg.getDot1())) {
                continue;
            }
            if (dotsCloser(intrDot, seg.getDot2())) {
                continue;
            }
            let base = seg.getBase();
            let seg1 = new Line(seg.getDot1(), dot).setBase(base);
            let seg2 = new Line(dot, seg.getDot2()).setBase(base);
            base.addSegment(seg1);
            base.addSegment(seg2);
            dot.setBaseLine(base);
            dot.removeIntersection(targetLine);
            dot.addIntersectionLine(seg1);
            dot.addIntersectionLine(seg2);
            base.removeSegment(seg);
            this.replaceIntersectionLines(seg, seg1, seg2);
            this.updateAnglesAfterSegmentation(seg, seg1, seg2);
            return;
        }
        if (targetLine.isSegment()) {
            let base = targetLine.getBase();
            let seg1 = new Line(targetLine.getDot1(), dot).setBase(base);
            let seg2 = new Line(dot, targetLine.getDot2()).setBase(base);
            base.addSegment(seg1);
            base.addSegment(seg2);
            dot.setBaseLine(base);
            dot.removeIntersection(targetLine);
            dot.addIntersectionLine(seg1);
            dot.addIntersectionLine(seg2);
            this.replaceIntersectionLines(targetLine, seg1, seg2);
            this.updateAnglesAfterSegmentation(targetLine, seg1, seg2);
            base.removeSegment(targetLine);
        } else {
            let line1 = new Line(targetLine.getDot1(), dot).setBase(targetLine);
            let line2 = new Line(dot, targetLine.getDot2()).setBase(targetLine);
            targetLine.addSegment(line1);
            targetLine.addSegment(line2);
            this.updateAnglesAfterSegmentation(targetLine, line1, line2);
            dot.removeIntersection(targetLine);
            dot.addIntersectionLine(line1);
            dot.addIntersectionLine(line2);
            this.replaceIntersectionLines(targetLine, line1, line2);
        }
    },

    replaceIntersectionLines(line, seg1, seg2) {
        for (let dot of this._elements.dots) {
            for (let int of dot.getIntersectionLines()) {
                if (int === line) {
                    let lineToReplace = seg1.isLineEnd(dot) ? seg1 : seg2;
                    dot.replaceIntersectionLine(int, lineToReplace);
                }
            }
        }
    },

    arrangeAngles(dot) {
        this._elements.angles = this._elements.angles.filter((x) => x.getDot() !== dot);

        if (dot.isIntersectionDot() || dot.isOnLine()) {
            let lines = dot.getIntersectionLines()
                .map(function (line) {
                    line.setAngle(getLineAngle(line, dot));
                    return line;
                })
                .sort(function (line1, line2) {
                    if (line1.getAngle() > line2.getAngle()) {
                        return 1;
                    } else if (line1.getAngle() < line2.getAngle()) {
                        return -1;
                    } else {
                        return 0;
                    }
                });

            for (let i = 0; i < lines.length; i++) {
                let line1 = lines[i];
                let line2 = lines[(i + 1) % lines.length];
                let newAngle = new Angle(dot).setLine1(line1).setLine2(line2);
                if (line1.getBaseOrSelf() === line2.getBaseOrSelf()) {
                    newAngle.setValue(180);
                }
                this._elements.angles.push(newAngle);
            }
        } else {
            let connectedLines = this._elements.lines
                .filter((x) => x.isLineEnd(dot))
                .map(function (line) {
                    line.setAngle(getLineAngle(line, dot));
                    return line;
                })
                .sort(function (line1, line2) {
                    if (line1.getAngle() > line2.getAngle()) {
                        return 1;
                    } else if (line1.getAngle() < line2.getAngle()) {
                        return -1;
                    } else {
                        return 0;
                    }
                });

            if (connectedLines.length === 0) {
                return;
            }
            for (let i = 0; i < connectedLines.length; i++) {
                let line1 = connectedLines[i];
                let line2 = connectedLines[(i + 1) % connectedLines.length];
                if (line1 === line2) {
                    continue;
                }
                this._elements.angles.push(new Angle(dot).setLine1(line1).setLine2(line2));
            }
        }
    },



    handleIntersectionDots(movingLine) {
        for (let intDot of this._elements.intersectionDots) {
            this.handleLineIntersection(movingLine, intDot)
        }
        this._elements.intersectionDots = [];
    },

    handleLineIntersection(movingLine, intDot) {
        if (movingLine) {
            intDot.addIntersectionLine(movingLine);
        }
        let newDot = intDot.getType() === 'Point' ? intDot.createDot() : intDot;
        this._elements.addDot(newDot);
        for (let line of newDot.getIntersectionLines()) {
            this.createSegmentLines(line, newDot);
        }
        this.arrangeAngles(newDot);
    },

    updateAnglesAfterSegmentation(deleted, new1, new2) {
        for (let ang of this._elements.angles) {
            if (ang.getLine1() === deleted) {
                ang.setLine1(new1.isLineEnd(ang.getDot()) ? new1 : new2);
            }
            if (ang.getLine2() === deleted) {
                ang.setLine2(new1.isLineEnd(ang.getDot()) ? new1 : new2);
            }
        }
    },

    handleDotOnLine(targetLine, dot) {
        dot.setBaseLine(targetLine);
        dot.setLineRatio(getDotsLineRatio(dot, targetLine));
        let newDotXY = getDotOnLineWithRatio(dot);
        dot.setX(newDotXY.getX());
        dot.setY(newDotXY.getY());

        let dotLines = this._elements.lines.filter((x) => x.isLineEnd(dot));
        for (let line of dotLines) {
            dot.addIntersectionLine(line);
        }

        this.createSegmentLines(targetLine, dot);
    },

    updateCanvasAngles() {
        for (let ang of this._elements.angles) {
            ang.setCanvasAngle(getAngleDegree(ang));
        }
    },

    updateHovered() {
        let hovered;
        let found = false;

        for (let dot of this._elements.dots) {
            dot.setHovered(false);
            if (!found && dotsCloser(dot, this._elements.currentDot) &&
                this._elements.dragDot !== dot) {
                dot.setHovered(true);
                hovered = { 'type': 'dot', 'obj': dot };
                found = true;
            }
        }

        for (let angle of this._elements.angles) {
            angle.setHovered(false);
            if (anglesCloser(this._elements.currentDot, angle.getDot())) {
                if (!found && dotBetweenAngle(angle, this._elements.currentDot)) {
                    hovered = { 'type': 'angle', 'obj': angle };
                    angle.setHovered(true);
                    found = true;
                }
            }
        }

        for (let line of this._elements.lines) {
            for (let seg of line.getSegments()) {
                seg.setHovered(false);
                if (seg.getDot1() === this._elements.getDragDotObject() ||
                    seg.getDot2() === this._elements.getDragDotObject()) {
                    continue;
                }
                if (!found && dotOnLineSegment(seg, this._elements.currentDot)) {
                    seg.setHovered(true);
                    hovered = { 'type': 'line', 'obj': seg };
                    found = true;
                }
            }
        }

        for (let line of this._elements.lines) {
            line.setHovered(false);
            if (line.getDot1() === this._elements.getDragDotObject() ||
                line.getDot2() === this._elements.getDragDotObject()) {
                continue;
            }
            if (!found && dotOnLine(line, this._elements.currentDot)) {
                line.setHovered(true);
                hovered = { 'type': 'line', 'obj': line };
                found = true;
            }
        }
        
        this._elements.hovered = hovered;
    },

    updateSelected(newClick) {
        if (newClick) {
            this.deselectAll();
        }

        if (!this._elements.hovered ||
            this._elements.dragDot ||
            this._elements.dragStartPoint) {
            return;
        }

        let hovered = this._elements.hovered.obj;
        if (this._mouseIsDown && hovered.getType() !== "Angle") {
            this._elements.selected = [];
        }
        if (this._elements.selected.length > 0 &&
            this._elements.selected[0].getType() !== hovered.getType()) {
            this._elements.selected = [];
        }

        if (this._mouseIsDown && hovered.getType() === "Angle" &&
            this._elements.dragDot == null &&
            this._elements.selected.indexOf(hovered) === -1) {
            this._elements.selected.push(hovered);
            return;
        } else if (!this._mouseIsDown &&
            this._elements.selected.indexOf(hovered) === -1) {
            this._elements.selected.push(hovered);
        }
        for (let el of this._elements.selected) {
            el.setSelected(true);
        }

        if (!this._mouseIsDown) {
            this.prepareInput();
        }
    },

    deselectAll() {
        this._elements.selected = [];
        for (let dot of this._elements.dots) {
            dot.setSelected(false);
        }
        for (let angle of this._elements.angles) {
            angle.setSelected(false);
        }
        for (let line of this._elements.lines) {
            for (let seg of line.getSegments()) {
                seg.setSelected(false);
            }
        }
        for (let line of this._elements.lines) {
            line.setSelected(false);
        }
    },

    updateDrawing() {
        this._canvas.update();
    },

    getSelected() {
        let selected = this._elements.selected;
        if (selected.length === 1) {
            return selected[0];
        }

        if (!(selected.length > 1 && selected[0].getType() === "Angle")) {
            throw 'Wrong selection: ' + selected.map((x) => x.toString()).join(", ") + ".";
        }

        let dots = selected
            .reduce(function (acc, x) {
                if (acc.indexOf(x.getDot()) === -1) {
                    acc.push(x.getDot());
                }
                return acc;
            }, []);
        if (dots.length > 1) {
            throw 'Angles belong to different dots.';
        }

        let orderedSelected = selected
            .sort(function (ang1, ang2) {
                let line1 = ang1.getLine1();
                let line2 = ang2.getLine1();

                let deg1 = getLineAngle(line1, ang1.getDot());
                let deg2 = getLineAngle(line2, ang1.getDot());

                if (deg1 < deg2) {
                    return 1;
                } else if (deg2 < deg1) {
                    return -1;
                } else {
                    return 0;
                }
            });


        let ang = this.findAngleWithArms(orderedSelected[orderedSelected.length - 1].getLine1(),
            orderedSelected[0].getLine2()
        );
        if (ang) {
            return ang;
        }

        for (let i = 0; i < orderedSelected.length; i++) {
            if (i === orderedSelected.length - 1) {
                continue;
            }
            if (
                orderedSelected[i].getLine1().getBaseOrSelf() !==
                orderedSelected[i + 1].getLine2().getBaseOrSelf()) {
                throw 'Angles not ordered';
            }
        }

        let angNew = new Angle(
            orderedSelected[0].getDot(),
            orderedSelected[orderedSelected.length - 1].getLine1(),
            orderedSelected[0].getLine2());
        for (let sel of orderedSelected) {
            angNew.addChild(sel);
        }
        this._elements.angles.push(angNew);
        return angNew;
    },

    getAll() {
        return {
            dots: this._elements.dots,
            lines: this._elements.lines,
            angles: this._elements.angles,
            parallels: this._parallels,
            equivalents: this._elements.equivalents,
            question: this._question
        };
    },

    reset() {
        resetNames();
        this._valueObject = null;
        this._question = null;
        this._parallels = [];
        this._elements.equivalents = [];
        this.setButtonState('line');
        this._elements.reset();
        this._canvas.update();
        document.getElementById('questionText').innerHTML = '';
        document.getElementById('answerText').innerHTML = '';
    },

    setQuestion(question) {
        this._question = question;
    },

    fillTestData(info) {
        document.getElementById('questionText').innerHTML = '';
        document.getElementById('answerText').innerHTML = '';
        document.getElementById('questionHeader').style.display = 'none';
        document.getElementById('answerHeader').style.display = 'none';

        for (let ang of info.angles) {
            ang.setCanvasAngle((getAngleDegree(ang)));
        }

        this._elements.lines = info.lines;
        this._elements.dots = info.dots;
        this._elements.angles = info.angles;
        this._parallels = info.parallels;
        this._question = info.question;
        this._elements.equivalents = info.equivalents;
        this._canvas.update();
        this.updateQuestionText();
    },

    prepareInput() {
        if (['angle', 'line'].indexOf(this._elements.hovered.type) === -1) {
            return;
        }

        let x = this._elements.currentDot.getX();
        let y = this._elements.currentDot.getY();

        let obj;
        let selected = this._elements.selected;
        if (selected.length > 1 && selected[0].getType() === "Angle") {
            let ang = this.findAngleWithArms(selected[selected.length - 1].getLine1(),
                selected[0].getLine2()
            );
            obj = ang;
        } else {
            obj = selected[0];
        }

        this.activateInput(x, y, obj ? obj.getValue() : null);
        this._valueObject = {
            'type': selected[0].getType(),
            'obj': this._elements.dragDot
        };
    },

    activateInput(x, y, value) {
        let input = document.getElementById('valueInput');
        input.style.display = 'block';
        input.style.position = 'absolute';
        input.style.left = `${this._canvas.getLeft() + x - 50}px`;
        input.style.top = `${this._canvas.getTop() + y - 50}px`;
        input.value = value || '';
    },

    deactivateInput() {
        let input = document.getElementById('valueInput');
        input.style.display = 'none';
        input.style.position = 'absolute';
        input.value = '';
    },

    updateQuestionText() {
        let text = getQuestionText(
            this._elements,
            this._parallels,
            this._elements.equivalents,
            this._question);

        let header = document.getElementById('questionHeader');
        header.style.display = text ? 'block' : 'none';
        document.getElementById('questionText').innerHTML = text;
    },

    findAngleWithArms(line1, line2) {
        for (let ang of this._elements.angles) {
            if (line1.getBaseOrSelf() !== ang.getLine1().getBaseOrSelf()) {
                continue;
            }
            if (line2.getBaseOrSelf() !== ang.getLine2().getBaseOrSelf()) {
                continue;
            }
            return ang;
        }
        return null;
    },

    setButtonState(state) {
        switch (state) {
            case 'line':
                this._buttonState = new LineState(this, this._elements, this._canvas);
                break;
            case 'triangle':
                this._buttonState = new TriangleState(this);
                break;
            case 'rectangle':
                this._buttonState = new RectangleState(this);
                break;
            case 'square':
                this._buttonState = new SquareState(this);
                break;
            case 'equal':
                this._buttonState = new EquivalenceState(this._elements);
                break;
            default:
                this._buttonState = new LineState(this, this._elements, this._canvas);
        }
    }
}

export default Drawing;