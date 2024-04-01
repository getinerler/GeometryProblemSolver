'use strict';

import Point from '../../../models/graphic/point.js';
import Line from '../../../models/graphic/line.js';
import Angle from '../../../models/graphic/angle.js';
import { lineIntersect, dotsCloser, getLineAngle } from './../geoHelper.js';
import { getDotOnLineWithRatio, getDistance } from './../geoHelper.js';

function LineState(drawing, canvasElements, canvas) {
    this._drawing = drawing;
    this._canvas = canvas;
    this._valueObject = null;
    this._elements = canvasElements;
}

LineState.prototype = {

    mouseDownEvent(x, y) {
        if (!this._elements.hovered) {
            this._elements.dragStartPoint = new Point(x, y);
        }
        this._elements.dragDot = null;
        if (this._elements.hovered && this._elements.hovered.type === "dot") {
            this._elements.dragDot = this._elements.hovered.obj;
        }
        if (this._elements.dragDot) {
            this.removeIntersectionDots();
        }
    },

    mouseMoveEvent(x, y) {
        if (this._elements.dragDot !== null) {
            this._elements.dragDot.update(x, y);
            this.updateDotsOnLine();
        }
        if (this._elements.dragStartPoint) {
            this.updateIntersectionDots();
        }
    },

    mouseUpEvent(x, y) {
        if (!this._elements.dragDot && this._elements.dragStartPoint) {
            this.createNewLine(x, y);
        } else if (this._elements.hovered &&
            this._elements.dragDot &&
            this._elements.hovered.obj !== this._elements.dragDot) {
            this.handleDraggedDot();
        }
        this._drawing.handleIntersectionDots();
        this._elements.dragDot = null;
        this._elements.dragStartPoint = null;
        this._drawing.updateCanvasAngles();
    },

    createNewLine(x, y) {
        let dot1 = this._elements.dragStartPoint.createDot();
        if (getDistance(dot1, new Point(x, y)) < 20) {
            return;
        }
        this._elements.dots.push(dot1);
        let dot2 = this._drawing.createDot(x, y);
        this._drawing.createNewLine(dot1, dot2);
    },

    handleDraggedDot() {
        let hovered = this._elements.hovered;
        let dragDot = this._elements.dragDot;
        if (hovered.type === 'dot') {
            this.makeTwoDotsSame(hovered.obj, dragDot);
            this.arrangeAngles(hovered.obj);
        } else if (hovered.type == 'line' && !hovered.obj.isLineEnd(dragDot)) {
            this._drawing.handleDotOnLine(hovered.obj, dragDot);
            this.arrangeAngles(dragDot);
        }
    },

    removeIntersectionDots() {
        let dot = this._elements.dragDot;
        let lines = this._elements.lines.filter((x) => x.isLineEnd(dot));

        let dotsToDelete = this._elements.dots.filter(function (x) {
            if (!x.isIntersectionDot()) {
                return false;
            }
            for (let l1 of lines) {
                for (let seg of l1.getSegments()) {
                    if (seg.isLineEnd(x)) {
                        return true;
                    }
                }
            }
            return false;
        });

        for (let line of this._elements.lines) {
            for (let seg of line.getSegments()) {
                if (dotsToDelete.indexOf(seg.getDot1()) > -1 ||
                    dotsToDelete.indexOf(seg.getDot2()) > -1)
                    line.removeSegment(seg);
            }
        }
        this._elements.angles = this._elements.angles
            .filter((x) => dotsToDelete.indexOf(x.getDot()) === -1);
        this._elements.dots = this._elements.dots
            .filter((x) => dotsToDelete.indexOf(x) === -1);
    },

    updateDotsOnLine() {
        let dot = this._elements.dragDot;
        let lines = this._elements.lines.filter((x) => x.isLineEnd(dot));
        let lineDots = this._elements.dots.filter(function (x) {
            return x.isOnLine() && lines.indexOf(x.getBaseLine()) > -1;
        })
        for (let dot of lineDots) {
            let newDot = getDotOnLineWithRatio(dot);
            dot.setX(newDot.getX());
            dot.setY(newDot.getY());
        }
    },

    updateIntersectionDots() {
        this._elements.intersectionDots = [];
        if (this._elements.dragStartPoint) {
            let dot1 = this._elements.dragStartPoint.copy();
            let dot2 = this._elements.currentDot.copy();
            let imaginaryLine = new Line(dot1, dot2);
            for (let line of this._elements.lines) {
                let intrDot = lineIntersect(line, imaginaryLine);
                if (!intrDot) {
                    continue;
                }
                if (dotsCloser(intrDot, line.getDot1())) {
                    continue;
                }
                if (dotsCloser(intrDot, line.getDot2())) {
                    continue;
                }
                intrDot.addIntersectionLine(line);
                this._elements.intersectionDots.push(intrDot);
            }
        }
        if (this._elements.dragDot) {
            let dragDot = this._elements.dragDot;
            let dragLines = this._elements.lines.filter((x) => x.isLineEnd(dragDot));

            for (let line1 of dragLines) {
                for (let line2 of this._elements.lines) {
                    if (line1 === line2) {
                        continue;
                    }
                    if (line1.isConnected(line2)) {
                        continue;
                    }
                    let intrDot = lineIntersect(line1, line2);

                    let interDot = this._elements.dots.find(function (x) {
                        if (!x.isIntersectionLine(line1)) {
                            return false;
                        }
                        if (!x.isIntersectionLine(line2)) {
                            return false;
                        }
                        return true;
                    });

                    if (intrDot === null) {
                        if (interDot) {
                            interDot.removeIntersection(line1);
                            if (interDot.getIntersectionLines().length === 1) {
                                this._elements.removeDot(interDot);
                            }
                        }
                    } else if (interDot && interDot.getIntersectionLines().length === 2) {
                        interDot.setX(intrDot.getX());
                        interDot.setY(intrDot.getY());
                    } else if (intrDot) {
                        intrDot.addIntersectionLine(line1);
                        intrDot.addIntersectionLine(line2);
                        this._elements.intersectionDots.push(intrDot);
                    }
                }
            }
        }
    },

    makeTwoDotsSame(dot1, dot2) {
        console.log("make same")
        for (let line of this._elements.lines) {
            if (line.getDot1() === dot2) {
                line.setDot1(dot1);
            }
            if (line.getDot2() === dot2) {
                line.setDot2(dot1);
            }
        }
        for (let ang of this._elements.angles) {
            if (ang.getDot() === dot2) {
                ang.setDot(dot1);
            }
        }
        this._elements.dots = this._elements.dots.filter((x) => x !== dot2);
    },

    arrangeAngles(dot) {
        this._elements.angles = this._elements.angles.filter((x) => x.getDot() !== dot);

        if (dot.isIntersectionDot() || dot.isOnLine()) {
            let lines = dot.getIntersectionLines()
                .map(function (line) {
                    line.setAngle(getLineAngle(line, dot));
                    return line;
                })
                .sort(function (line1, line2) {
                    if (line1.getAngle() > line2.getAngle()) {
                        return 1;
                    } else if (line1.getAngle() < line2.getAngle()) {
                        return -1;
                    } else {
                        return 0;
                    }
                });

            for (let i = 0; i < lines.length; i++) {
                let line1 = lines[i];
                let line2 = lines[(i + 1) % lines.length];
                let newAngle = new Angle(dot).setLine1(line1).setLine2(line2);
                if (line1.getBaseOrSelf() === line2.getBaseOrSelf()) {
                    newAngle.setValue(180);
                }
                this._elements.angles.push(newAngle);
            }
        } else {
            let connectedLines = this._elements.lines.filter((x) => x.isLineEnd(dot));
            if (connectedLines.length === 0) {
                return;
            }
            for (let i = 0; i < connectedLines.length; i++) {
                let line1 = connectedLines[i];
                let line2 = connectedLines[(i + 1) % connectedLines.length];
                if (line1 === line2) {
                    continue;
                }
                this._elements.angles.push(new Angle(dot).setLine1(line1).setLine2(line2));
            }
            let filtered = connectedLines.filter((x) => x.getBase() === null);
            for (let i = 0; i < filtered.length; i++) {
                let line1 = filtered[i];
                let line2 = filtered[(i + 1) % filtered.length];
                if (line1 === line2) {
                    continue;
                }
                if (!this._elements.angles
                    .some((x) => x.getLine1() === line1 && x.getLine2() === line2)) {
                    this._elements.angles.push(new Angle(dot).setLine1(line1).setLine2(line2));
                }
            }
        }
    }
}

export default LineState;