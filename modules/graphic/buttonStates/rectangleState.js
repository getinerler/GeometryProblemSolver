'use strict';

import Dot from "../../../models/graphic/dot.js";
import Line from "../../../models/graphic/line.js";

function RectangleState(drawing, elements) {
    this._drawing = drawing;
    this._elements = elements;
}

RectangleState.prototype = {

    mouseDownEvent() {

    },

    mouseMoveEvent(x, y) {
        this._elements.imaginaryLines = [];

        let dot1 = new Dot(x - 150, y - 100, ' ');
        let dot2 = new Dot(x + 150, y - 100, ' ');
        let dot3 = new Dot(x + 150, y + 100, ' ');
        let dot4 = new Dot(x - 150, y + 100, ' ');

        let line1 = new Line(dot1, dot2);
        let line2 = new Line(dot2, dot3);
        let line3 = new Line(dot3, dot4);
        let line4 = new Line(dot1, dot4);

        this._elements.imaginaryLines = [line1, line2, line3, line4];
    },

    mouseUpEvent(x, y) {
        let dot1 = this._drawing.createDot(x - 150, y - 100);
        let dot2 = this._drawing.createDot(x + 150, y - 100);
        let dot3 = this._drawing.createDot(x + 150, y + 100);
        let dot4 = this._drawing.createDot(x - 150, y + 100);

        this._drawing.createNewLine(dot1, dot2);
        this._drawing.createNewLine(dot2, dot3);
        this._drawing.createNewLine(dot3, dot4);
        this._drawing.createNewLine(dot1, dot4);

        this._drawing.arrangeAngles(dot1);
        this._drawing.arrangeAngles(dot2);
        this._drawing.arrangeAngles(dot3);
        this._drawing.arrangeAngles(dot4);

        this._drawing.setButtonState('line');
    }
}

export default RectangleState;