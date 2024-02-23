'use strict';

import Canvas from '../graphic/canvas.js';
import CanvasElements from '../../models/graphic/canvasElements.js';
import { getQuestionText } from './texts.js';
import LineState from './buttonStates/lineState.js';

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
        this._buttonState = new LineState(this, self._elements, self._canvas);

        canvas.addEventListener('mousemove', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self._buttonState.mouseMoveEvent(x, y);
        });
        canvas.addEventListener('mousedown', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self._buttonState.mouseDownEvent(x, y);
        });
        canvas.addEventListener('mouseup', function (event) {
            let x = event.pageX - self._canvas.getLeft();
            let y = event.pageY - self._canvas.getTop();
            self._buttonState.mouseUpEvent(x, y);
        });
        return this;
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