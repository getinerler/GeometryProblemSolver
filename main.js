'use strict';

import TestData from './tests/testData.js';
import App from './app.js';

let params = {
    canvas: 'canvas',
    inputElement: 'valueInput',
    solveButton: 'solveButton',
    resetButton: 'resetButton',
    questionDiv: 'questionDiv',
    answerDiv: 'answerDiv'
};

let app = new App(params);
app.run();

function loadTestMenu() {
    let testsDiv = document.getElementById('testBody');
    let tableText = '';
    for (let question in TestData) {
        tableText +=
            '<tr><td><button class="testDataButton" ' +
            `questionName="${question}">` +
            TestData[question].name +
            '</button></td></tr>';
    }
    testsDiv.innerHTML += tableText;

    let buttons = document.getElementsByClassName('testDataButton');
    for (let button of buttons) {
        let test = button.getAttribute('questionName');
        button.onclick = function () {
            app.fillTestData(TestData[test].getQuestion());
        };
    }
}

loadTestMenu();