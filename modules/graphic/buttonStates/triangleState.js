'use strict';

function TriangleState(drawing) {
    this._drawing = drawing;
}

TriangleState.prototype = {

    mouseDownEvent() {

    },

    mouseMoveEvent() {

    },

    mouseUpEvent(x, y) {
        let dot1 = this._drawing.createDot(x, y - 100);
        let dot2 = this._drawing.createDot(x - 150, y + 100);
        let dot3 = this._drawing.createDot(x + 150, y + 100);

        this._drawing.createNewLine(dot1, dot2);
        this._drawing.createNewLine(dot2, dot3);
        this._drawing.createNewLine(dot1, dot3);

        this._drawing.arrangeAngles(dot1);
        this._drawing.arrangeAngles(dot2);
        this._drawing.arrangeAngles(dot3);
    }
}

export default TriangleState;