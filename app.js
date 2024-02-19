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

    this._drawing = null;
}

App.prototype = {

    run() {
        let self = this;
        let canvas = document.getElementById(this._canvas);
        self._drawing = new Drawing().bind(canvas);

        document.getElementById(this._inputElement)
            .addEventListener('keydown', function (event) {
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

        document.getElementById(this._solveButton)
            .addEventListener('click', function () {
                let question = self._drawing.getAll();
                let solve = new Solve(question).solve();
                if (solve.solved) {
                    showAsAnswer(getEquationsText(solve.equations));
                } else {
                    showAsAnswer(solve.message);
                    showAsAnswer(solve.equations.map(function (x) {
                        return x.toString();
                    }).join('</br>'));
                }
            });

        document.getElementById(self._resetButton)
            .addEventListener('click', function () {
                question = self._drawing.reset();
            });

        function showAsAnswer(it) {
            document.getElementById(self._answerDiv).innerHTML = it + '</br>';
        }
    },

    fillTestData(data) {
        resetNames();
        this._drawing.fillTestData(data);
    }
}

export default App;

