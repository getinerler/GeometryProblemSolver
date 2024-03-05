'use strict';

function RectangleState(drawing) {
    this._drawing = drawing;
}

RectangleState.prototype = {

    mouseDownEvent() {

    },

    mouseMoveEvent() {

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
    }
}

export default RectangleState;