'use strict';

import Canvas from '../graphic/canvas.js';
import CanvasElements from '../../models/graphic/canvasElements.js';
import { dotOnLine, dotsCloser, anglesCloser, dotBetweenAngle } from './geoHelper.js';
import { dotOnLineSegment, getLineAngle, lineIntersect } from './geoHelper.js';
import { getDotsLineRatio, getDotOnLineWithRatio } from './geoHelper.js';
import { getQuestionText } from './texts.js';
import LineState from './buttonStates/lineState.js';
import EquivalenceState from './buttonStates/equivalenceState.js';
import { resetNames } from './names.js';
import Dot from '../../models/graphic/dot.js';
import Line from '../../models/graphic/line.js';
import Parallel from '../../models/graphic/parallel.js';
import Angle from '../../models/graphic/angle.js';
import TriangleState from './buttonStates/triangleState.js';
import RectangleState from './buttonStates/rectangleState.js';
import SquareState from './buttonStates/squareState.js';

function Drawing() {
    this._canvas = null;
    this._valueObject = null;
    this._question = null;
    this._parallels = [];
    this._equivalents = [];
    this._elements = new CanvasElements();
    this._buttonState = null;
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
            self._canvas.update();
        });
        canvas.addEventListener('mousedown', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self._elements.currentDot.update(x, y);
            self.updateHovered();
            self._buttonState.mouseDownEvent(x, y);
            self._canvas.update();
        });
        canvas.addEventListener('mouseup', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self._elements.currentDot.update(x, y);
            self.updateHovered();
            self._buttonState.mouseUpEvent(x, y);
            self._canvas.update();
            self.updateQuestionText();
        });
        return this;
    },

    createDot(x, y) {
        let hovered = this._elements.hoveredObject;
        let dot = hovered && hovered.type === 'dot' ? hovered.obj : new Dot(x, y);
        this._elements.addDot(dot);
        return dot;
    },

    createNewLine(dot1, dot2) {
        let line;
        if (!this._elements.hoveredObject) {
            line = new Line(dot1, dot2);
            this.saveTempParallels(line);
            this._elements.addLine(line);
        } else {
            let hovered = this._elements.hoveredObject;
            if (hovered.type === 'dot') {
                line = new Line(dot1, dot2);
                this.saveTempParallels(line);
                this._elements.addLine(line);
            } else if (hovered.type === 'line') {
                line = new Line(dot1, dot2);
                this.saveTempParallels(line);
                this._elements.addLine(line);
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
            let connectedLines = this._elements.lines.filter((x) => x.isLineEnd(dot));
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

    saveTempParallels(newLine) {
        if (newLine) {
            if (this._elements.parallelsTemp.length === 0) {
                this._elements.parallelsTemp.push([newLine]);
            } else {
                this._elements.parallelsTemp[0].push(newLine);
            }
        }
        for (let parallelTemp of this._elements.parallelsTemp) {
            let found = false;
            for (let parallel of this.getParallels()) {
                if (parallel.containsList(parallelTemp)) {
                    found = true;
                    for (let line of parallelTemp) {
                        if (!parallel.contains(line)) {
                            parallel.add(line);
                        }
                    }
                }
            }
            if (!found) {
                this.addParallel(new Parallel(parallelTemp));
            }
        }
        this._elements.parallelsTemp = [];
    },

    handleIntersectionDots(movingLine) {
        for (let intDot of this._elements.intersectionDots) {
            this.handleLineIntersection(movingLine, intDot)
        }
        this._elements.intersectionDots = [];
    },

    handleLineIntersection(movingLine, intDot) {
        intDot.addIntersectionLine(movingLine);
        let newDot = intDot.createDot();
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
        this.arrangeAngles(dot);
    },

    updateHovered() {
        let hoveredObject;
        let found = false;
        for (let dot of this._elements.dots) {
            dot.setHovered(false);
            if (!found && dotsCloser(dot, this._elements.currentDot) &&
                this._elements.dragDot !== dot) {
                dot.setHovered(true);
                hoveredObject = { 'type': 'dot', 'obj': dot };
                found = true;
            }
        }
        for (let angle of this._elements.angles) {
            angle.setHovered(false);
            if (anglesCloser(this._elements.currentDot, angle.getDot())) {
                if (!found && dotBetweenAngle(angle, this._elements.currentDot)) {
                    hoveredObject = { 'type': 'angle', 'obj': angle };
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
                    hoveredObject = { 'type': 'line', 'obj': seg };
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
                hoveredObject = { 'type': 'line', 'obj': line };
                found = true;
            }
        }
        this._elements.hoveredObject = hoveredObject;
    },

    updateDrawing() {
        this._canvas.update();
    },

    getValueObject() {
        return this._buttonState.getValueObject();
    },

    getParallels() {
        return this._parallels;
    },

    addParallel(parallel) {
        this._parallels.push(parallel);
    },

    setParallels(parallels) {
        this._parallels = parallels;
    },

    getAll() {
        return {
            dots: this._elements.dots,
            lines: this._elements.lines,
            angles: this._elements.angles,
            parallels: this._parallels,
            equivalents: this._equivalents,
            question: this._question
        };
    },

    reset() {
        resetNames();
        this._valueObject = null;
        this._question = null;
        this._parallels = [];
        this._equivalents = [];
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

        this._elements.lines = info.lines;
        this._elements.dots = info.dots;
        this._elements.angles = info.angles;
        this._parallels = info.parallels;
        this._question = info.question;
        this._equivalents = info.equivalents;
        this._canvas.update();
        this.updateQuestionText();
    },

    activateInput(x, y, value) {
        let input = document.getElementById('valueInput');
        input.style.display = 'block';
        input.style.position = 'absolute';
        input.style.left = `${this._canvas.getLeft() + x}px`;
        input.style.top = `${this._canvas.getTop() + y}px`;
        input.value = value || '';
    },

    updateQuestionText() {
        let text = getQuestionText(
            this._elements,
            this._parallels,
            this._equivalents,
            this._question);

        let header = document.getElementById('questionHeader');
        header.style.display = text ? 'block' : 'none';
        document.getElementById('questionText').innerHTML = text;
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
                this._buttonState = new EquivalenceState(this._elements, this._equivalents);
                break;
            default:
                this._buttonState = new LineState(this, this._elements, this._canvas);
        }
    }
}

export default Drawing;