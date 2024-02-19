'use strict';

import Point from '../../models/graphic/point.js';

function CanvasElements() {
    this.dots = [];
    this.lines = [];
    this.lineSegments = [];
    this.angles = [];
    this.intersectionDots = [];
    this.parallelsTemp = [];
    this.dragStartPoint = null;
    this.dragDot = null;
    this.currentDot = new Point(0, 0);
    this.hoveredObject = null
}

CanvasElements.prototype = {

    getDragDotObject() {
        if (this._dragDot) {
            return this._dragDot.obj;
        }
        return null;
    },

    addDot(dot) {
        this.dots.push(dot);
    },

    removeDot(dot) {
        this.dots = this.dots.filter((x) => x !== dot);
        this.lines = this.lines.filter((x) => !x.isLineEnd(dot));
        this.angles = this.angles.filter((x) => x.getDot() !== dot);
        for (let line of this.lines) {
            for (let seg of line.getSegments()) {
                if (seg.isLineEnd(dot)) {
                    line.removeSegment(seg);
                }
            }
        }
    },

    addLine(line) {
        this.lines.push(line);
    },

    reset() {
        this.dots = [];
        this.lines = [];
        this.angles = [];
        this.intersectionDots = [];
        this.parallelsTemp = [];
        this.dragStartPoint = null;
        this.dragDot = null;
        this.currentDot = new Point(0, 0);
        this.hoveredObject = null
    },

    showDetailed() {
        console.log('dots: ' + this.dots
            .map(function (x) {
                return x.getName() +
                    (x.getBaseLine() ?
                        '(baseLine:' + x.getBaseLine().toString() + '?' : '');
            })
            .join(','));

        console.log('lines: ' + this.lines
            .map(function (x) {
                return x.getName() +
                    '(d1: ' + x.getDot1().toString() +
                    ', d2: ' + x.getDot2().toString() +
                    (x.getBase() ? ' , base:' + x.getBase().toString() : '')
                    + ')';
            })
            .join(','));


        for (let line of this.lines) {
            for (let seg of line.getSegments()) {
                console.log(seg.toString());
                console.log('seg: ' +
                    seg.getDot1().toString() + seg.getDot2().toString());
            }
        }

        console.log('angles: ' + this.angles
            .map(function (x) {
                return x.getName() +
                    '(d: ' + x.getDot().toString() +
                    '(l1: ' + x.getLine1().toString() +
                    ', l2: ' + x.getLine2().toString() + ')'
                    + (x.isKnown() ? ' = ' + x.getValue() : '')
                    ;
            })
            .join(','));

        console.log('......................');
    }
}

export default CanvasElements;