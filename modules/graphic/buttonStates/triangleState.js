'use strict';

function TriangleState(drawing, canvasElements, canvas) {
    this._drawing = drawing;
    this._canvas = canvas;
    this._valueObject = null;
    this._elements = canvasElements;
}

TriangleState.prototype = {

    mouseDownEvent(x, y) { 
      
    },

    mouseMoveEvent(x, y) {
        
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
    },

    getValueObject() {
        let obj = this._valueObject;
        this._valueObject = null;
        return obj;
    },

    updateDrawing() {
        this._canvas.update();
    }
}

export default TriangleState;