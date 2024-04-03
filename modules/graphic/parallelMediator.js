'use strict';

import Line from '../../models/graphic/line.js';
import Parallel from '../../models/graphic/parallel.js';
import { linesParallel } from './geoHelper.js';

function ParallelMediator(drawing, elements) {
    this._drawing = drawing;
    this._elements = elements;
}

ParallelMediator.prototype = {

    mouseDownEvent() {
        if (this._elements.dragDot) {
            this.removeDotParallels();
        }
    },

    mouseMoveEvent() {
        if (this._drawing._mouseIsDown) {
            this.updateParallelsTemp();
        }
    },

    mouseUpEvent() {
        this.removeUnnecessaryParallels();
        this.saveTempParallels();
    },

    saveTempParallels() {
        if (this._drawing._newLine) {
            if (this._elements.parallelsTemp.length !== 0) {
                this._elements.parallelsTemp[0].push(this._drawing._newLine);
                this._drawing._newLine = null;
            }
        }
        for (let parallelTemp of this._elements.parallelsTemp) {
            let found = false;
            for (let parallel of this._drawing._parallels) {
                if (parallel.containsList(parallelTemp)) {
                    found = true;
                    for (let line of parallelTemp) {
                        if (!parallel.contains(line)) {
                            parallel.add(line);
                        }
                    }
                }
            }
            if (!found) {
                this._drawing._parallels.push(new Parallel(parallelTemp));
            }
        }
        this._elements.parallelsTemp = [];
    },

    updateParallelsTemp() {
        this._elements.parallelsTemp = [];

        //New line is being created
        if (!this._elements.dragDot) {
            let dot1 = this._elements.dragStartPoint.copy();
            let dot2 = this._elements.currentDot.copy();
            let imaginaryLine = new Line(dot1, dot2);
            for (let line of this._elements.lines) {
                if (linesParallel(line, imaginaryLine)) {
                    if (!this._elements.parallelsTemp.some((x) => x.indexOf(line) > -1)) {
                        this._elements.parallelsTemp.push([line]);
                    }
                }
            }
            return;
        }

        for (let i = 0; i < this._elements.lines.length; i++) {
            for (let j = i + 1; j < this._elements.lines.length; j++) {
                let line1 = this._elements.lines[i];
                let line2 = this._elements.lines[j];
                if (linesParallel(line1, line2)) {
                    let found;
                    for (let parallel of this._elements.parallelsTemp) {
                        found = parallel.find(function (line) {
                            return line === line1 || line === line2;
                        });
                        if (found) {
                            if (parallel.indexOf(line1) === -1) {
                                parallel.push(line1);
                            }
                            if (parallel.indexOf(line2) === -1) {
                                parallel.push(line2);
                            }
                        }
                    }
                    if (!found) {
                        this._elements.parallelsTemp.push([line1, line2]);
                    }
                }
            }
        }
    },

    removeDotParallels() {
        let self = this;
        let dotLines = this._elements.lines.filter(function (line) {
            return line.getDot1() === self._elements.dragDot ||
                line.getDot2() === self._elements.dragDot;
        });
        this._drawing._parallels =
            this._drawing._parallels.filter((x) => !x.containsList(dotLines));
    },

    removeUnnecessaryParallels() {
        this._drawing._parallels =
            this._drawing._parallels.filter((x) => x.getLines().length >= 2);
    }
}

export default ParallelMediator;