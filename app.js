'use strict'

import Drawing from './modules/graphic/drawing.js';
import Solve from './modules/solve/solve.js';
import { getEquationsText } from './modules/graphic/texts.js';
import { resetNames } from './modules/graphic/names.js';

function App(params) {
    this._canvas = params.canvas;
    this._inputElement = params.inputElement;
    this._solveButton = params.solveButton;
    this._resetButton = params.resetButton;
    this._questionDiv = params.questionDiv;
    this._answerDiv = params.answerDiv;
    this._solve = null;
    this._drawing = null;
}

App.prototype = {

    run() {
        let self = this;
        let canvas = document.getElementById(this._canvas);
        self._drawing = new Drawing().bind(canvas);

        document.getElementById(this._inputElement).addEventListener('keydown', function (event) {
            if (event.keyCode === 13) {
                let hoveredObj = self._drawing.getValueObject();
                if (hoveredObj !== null) {
                    hoveredObj.obj.setValue(this.value);
                    self._drawing.updateDrawing();
                }
                if (this.value === '?') {
                    self._drawing.setQuestion(hoveredObj.obj);
                }
                self._drawing.updateQuestionText();
                this.style.display = 'none';
            }
        });

        document.getElementById(this._solveButton).addEventListener('click', function () {
            document.getElementById('showAll').checked = false;
            let question = self._drawing.getAll();
            self._solve = new Solve(question).solve();
            document.getElementById('answerHeader').style.display = 'block';
            self.showAnswer(self._solve);
        });

        document.getElementById("showAll").addEventListener('click', function () {
            self.showAnswer(self._solve);
        });

        let buttonNames = [
            'lineButton',
            'triangleButton',
            'rectangleButton',
            'squareButton',
            'equalButton'];

        for (let buttonName of buttonNames) {
            let el = document.getElementById(buttonName);
            el.addEventListener('click', function () {
                self.unselectCanvasButtons();
                el.classList.add('selected');
                self._drawing.setButtonState(buttonName.replace('Button', ''));
            });
        }

        document.getElementById(self._resetButton).addEventListener('click', function () {
            document.getElementById('questionHeader').style.display = 'none';
            document.getElementById('answerHeader').style.display = 'none';
            question = self._drawing.reset();
        });
    },

    showAnswer(solve) {
        let showAll = document.getElementById('showAll').checked;
        if (!solve.solved) {
            showAsAnswer(solve.message);
        }
        this.showAsAnswer(getEquationsText(solve, showAll));
    },

    showAsAnswer(it) {
        document.getElementById('answerText').innerHTML = it + '</br>';
    },

    unselectCanvasButtons() {
        let buttons = document.getElementsByClassName('canvasButton');
        for (let button of buttons) {
            button.classList.remove('selected');
        }
    },

    fillTestData(data) {
        resetNames();
        this._drawing.fillTestData(data);
    }
}

export default App;

