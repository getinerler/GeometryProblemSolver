'use strict';

import Point from '../../models/graphic/point.js';
import Dot from '../../models/graphic/dot.js';
import Line from '../../models/graphic/line.js';
import Angle from '../../models/graphic/angle.js';
import Parallel from '../../models/graphic/parallel.js';
import Canvas from '../graphic/canvas.js';
import CanvasElements from '../../models/graphic/canvasElements.js';
import { getDistance, dotsCloser, anglesCloser } from './geoHelper.js';
import { dotOnLine, dotOnLineSegment, lineIntersect } from './geoHelper.js';
import { linesParallel, getLineAngle, dotBetweenAngle } from './geoHelper.js';
import { getDotOnLineWithRatio, getDotsLineRatio } from './geoHelper.js';
import { getQuestionText } from './texts.js';

function Drawing() {
    this._canvas = null;
    this._valueObject = null;
    this._question = null;
    this._parallels = [];
    this._elements = new CanvasElements();
}

Drawing.prototype = {

    bind(canvas) {
        let self = this;
        self._canvas = new Canvas(canvas, this._elements);

        canvas.addEventListener('mousemove', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self.mouseMoveEvent(x, y);
        });
        canvas.addEventListener('mousedown', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self.mouseDownEvent(x, y);
        });
        canvas.addEventListener('mouseup', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self.mouseUpEvent(x, y);
        });
        return this;
    },

    mouseDownEvent(x, y) {
        this._elements.currentDot.update(x, y);
        this._elements.dragStartPoint = new Point(x, y);
        this.updateHovered();
        this._elements.dragDot = null;
        if (this._elements.hoveredObject) {
            this._elements.dragDot = this._elements.hoveredObject.obj;
        }
        if (this._elements.dragDot) {
            this.updateParallels();
        }
    },

    mouseMoveEvent(x, y) {
        this._elements.currentDot.update(x, y);
        this.updateHovered();
        if (this._elements.dragStartPoint !== null && this._elements.dragDot) {
            this._elements.dragDot.update(x, y);
            this.updateDotsOnLine();
        }
        this.updateIntersectionDots();
        if (this._elements.dragDot) {
            this.updateParallelsTemp();
        }
        this._canvas.update();
    },

    mouseUpEvent(x, y) {
        this._elements.currentDot.update(x, y);

        this.saveTempParallels();
        if (!this._elements.dragDot) {
            this.createNewLine(x, y);
        } else {
            if (this._elements.dragStartPoint.same(this._elements.currentDot)) {
                this.prepareInput(x, y);
            } else if (this._elements.hoveredObject) {
                if (this._elements.hoveredObject.obj !== this._elements.dragDot) {
                    this.handleDraggedDot();
                }
            }
        }
        this._elements.dragDot = null;
        this._elements.dragStartPoint = null;
        this.updateQuestionText();
    },

    prepareInput(x, y) {
        if (['angle', 'line'].indexOf(this._elements.hoveredObject.type) === -1) {
            return;
        }
        this.activateInput(x, y, this._elements.hoveredObject.obj.getValue());
        this._valueObject = {
            'type': this._elements.hoveredObject.type,
            'obj': this._elements.dragDot
        };
    },

    createNewLine(x, y) {
        let dot1 = this._elements.dragStartPoint.createDot();
        this._elements.addDot(dot1);
        let dot2;
        let line;
        if (!this._elements.hoveredObject) {
            dot2 = new Dot(x, y);
            this._elements.addDot(dot2);
            line = new Line(dot1, dot2);
            this._elements.addLine(line);
        } else {
            let hovered = this._elements.hoveredObject;
            if (hovered.type === 'dot') {
                dot2 = hovered.obj;
                line = new Line(dot1, dot2);
                this._elements.addLine(line);
            } else if (hovered.type === 'line') {
                dot2 = new Dot(x, y);
                line = new Line(dot1, dot2);
                this._elements.addLine(line);
                this._elements.addDot(dot2);
                this.handleDotOnLine(hovered.obj, dot2);
            }
        }
        this.handleIntersectionDots(line);
        this.arrangeAngles(dot2);
    },

    handleDraggedDot() {
        let hoveredObj = this._elements.hoveredObject;
        let dragDot = this._elements.dragDot;
        if (hoveredObj.type === 'dot') {
            this.makeTwoDotsSame(hoveredObj.obj, dragDot);
            this.arrangeAngles(hoveredObj.obj);
        } else if (hoveredObj.type == 'line' && !hoveredObj.obj.isLineEnd(dragDot)) {
            this.handleDotOnLine(hoveredObj.obj, dragDot);
            this.arrangeAngles(dragDot);
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

    updateDotsOnLine() {
        let dot = this._elements.dragDot;
        let lines = this._elements.lines.filter((x) => x.isLineEnd(dot));
        let lineDots = this._elements.dots.filter(function (x) {
            return x.isOnLine() && lines.indexOf(x.getBaseLine()) > -1;
        })
        for (let dot of lineDots) {
            let newDot = getDotOnLineWithRatio(dot);
            dot.setX(newDot.getX());
            dot.setY(newDot.getY());
        }
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

    updateIntersectionDots() {
        this._elements.intersectionDots = [];
        if (this._elements.dragStartPoint) {
            let dot1 = this._elements.dragStartPoint.copy();
            let dot2 = this._elements.currentDot.copy();
            let imaginaryLine = new Line(dot1, dot2);
            for (let line of this._elements.lines) {
                let intrDot = lineIntersect(line, imaginaryLine);
                if (!intrDot) {
                    continue;
                }
                if (dotsCloser(intrDot, line.getDot1())) {
                    continue;
                }
                if (dotsCloser(intrDot, line.getDot2())) {
                    continue;
                }
                intrDot.addIntersectionLine(line);
                this._elements.intersectionDots.push(intrDot);
            }
        }
        if (this._elements.dragDot) {
            let dragDot = this._elements.dragDot;
            let dragLines = this._elements.lines.filter((x) => x.isLineEnd(dragDot));

            for (let line1 of dragLines) {
                for (let line2 of this._elements.lines) {
                    if (line1 === line2) {
                        continue;
                    }
                    if (line1.isConnected(line2)) {
                        continue;
                    }
                    let intrDot = lineIntersect(line1, line2);

                    let interDot = this._elements.dots.find(function (x) {
                        if (!x.isIntersectionLine(line1)) {
                            return false;
                        }
                        if (!x.isIntersectionLine(line2)) {
                            return false;
                        }
                        return true;
                    });

                    if (intrDot === null) {
                        if (interDot) {
                            interDot.removeIntersection(line1);
                            if (interDot.getIntersectionLines().length === 1) {
                                this._elements.removeDot(interDot);
                            }
                        }
                    } else if (interDot && interDot.getIntersectionLines().length === 2) {
                        interDot.setX(intrDot.getX());
                        interDot.setY(intrDot.getY());
                    } else if (intrDot) {
                        intrDot.addIntersectionLine(line1);
                        intrDot.addIntersectionLine(line2);
                        this._elements.intersectionDots.push(intrDot);
                    }
                }
            }
        }
    },

    saveTempParallels() {
        for (let parallelTemp of this._elements.parallelsTemp) {
            let found = false;
            for (let parallel of this._parallels) {
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
                this._parallels.push(new Parallel(parallelTemp));
            }
        }
        this._elements.parallelsTemp = [];
    },

    updateParallels() {
        let self = this;
        let dotLines = this._elements.lines.filter(function (line) {
            return line.getDot1() === self._elements.dragDot ||
                line.getDot2() === self._elements.dragDot;
        });
        this._parallels = this._parallels.filter((x) => !x.containsList(dotLines));
    },

    updateParallelsTemp() {
        this._elements.parallelsTemp = [];
        for (let i = 0; i < this._elements.lines.length; i++) {
            for (let j = i + 1; j < this._elements.lines.length; j++) {
                let line1 = this._elements.lines[i];
                let line2 = this._elements.lines[j];
                if (linesParallel(line1, line2)) {
                    let found;
                    for (let parallel of this._elements.parallelsTemp) {
                        found = parallel.find(function (line) {
                            return line === line1 || line === line2;
                        });
                        if (found) {
                            if (parallel.indexOf(line1) === -1) {
                                parallel.push(line1);
                            }
                            if (parallel.indexOf(line2) === -1) {
                                parallel.push(line2);
                            }
                        }
                    }
                    if (!found) {
                        this._elements.parallelsTemp.push([line1, line2]);
                    }
                }
            }
        }
    },

    makeTwoDotsSame(dot1, dot2) {
        for (let line of this._elements.lines) {
            if (line.getDot1() === dot2) {
                line.setDot1(dot1);
            }
            if (line.getDot2() === dot2) {
                line.setDot2(dot1);
            }
        }
        this._elements.dots = this._elements.dots.filter((x) => x !== dot2);
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

    updateDrawing() {
        this._canvas.update();
    },

    getValueObject() {
        let obj = this._valueObject;
        this._valueObject = null;
        return obj;
    },

    getAll() {
        return {
            dots: this._elements.dots,
            lines: this._elements.lines,
            angles: this._elements.angles,
            parallels: this._parallels,
            question: this._question
        };
    },

    reset() {
        this._elements.reset();
        this._canvas.update();
        document.getElementById('questionDiv').innerHTML = '';
        document.getElementById('answerDiv').innerHTML = '';
    },

    setQuestion(question) {
        this._question = question;
    },

    fillTestData(info) {
        document.getElementById('questionDiv').innerHTML = '';
        document.getElementById('answerDiv').innerHTML = '';
        this._elements.lines = info.lines;
        this._elements.dots = info.dots;
        this._elements.angles = info.angles;
        this._parallels = info.parallels;
        this._question = info.question;
        this._canvas.update();
        this.updateQuestionText();
    },

    activateInput(x, y, value) {
        let input = document.getElementById('valueInput');
        input.style.display = 'block';
        input.style.position = 'absolute';
        input.style.left = `${this._canvas.left + x}px`;
        input.style.top = `${this._canvas.top + y}px`;
        input.value = value || '';
    },

    updateQuestionText() {
        let text = getQuestionText(this._elements, this._parallels, this._question);
        document.getElementById('questionDiv').innerHTML = text;
    }
}

export default Drawing;