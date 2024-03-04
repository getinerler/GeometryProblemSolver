'use strict';

import Canvas from '../graphic/canvas.js';
import CanvasElements from '../../models/graphic/canvasElements.js';
import { dotOnLine, dotsCloser, anglesCloser, dotBetweenAngle } from './geoHelper.js';
import { dotOnLineSegment } from './geoHelper.js';
import { getQuestionText } from './texts.js';
import LineState from './buttonStates/lineState.js';
import EquivalenceState from './buttonStates/equivalenceState.js';
import { resetNames } from './names.js';

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
        self.setLineState();

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
        this.setLineState();
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
        document.getElementById('questionHeader').style.display = "none";
        document.getElementById('answerHeader').style.display = "none";

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
        input.style.left = `${this._canvas.left + x}px`;
        input.style.top = `${this._canvas.top + y}px`;
        input.value = value || '';
    },

    updateQuestionText() {
        let text = getQuestionText(
            this._elements,
            this._parallels,
            this._equivalents,
            this._question);

        let header = document.getElementById('questionHeader');
        header.style.display = text ? "block" : "none";
        document.getElementById('questionText').innerHTML = text;
    },

    setLineState() {
        this._buttonState = new LineState(this, this._elements, this._canvas);
    },

    setEquivalenceState() {
        this._buttonState = new EquivalenceState(this._elements, this._equivalents);
    }
}

export default Drawing;