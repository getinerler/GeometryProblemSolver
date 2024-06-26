'use strict';

import Line from '../../models/graphic/line.js';
import { getLineAngleRadian, getAngleTextPoint, getLineTextPoint } from './geoHelper.js';
import { getLongLine, get90DegreeSymbolPoints, getAngleSimilarSymbolI } from './geoHelper.js';
import { getLineSimilarSymbolLine1, getLineSimilarSymbolLine2 } from './geoHelper.js';
import { getDotNamePoint } from './geoHelper.js';

function Canvas(canvas, canvasObjects) {
    if (!canvas) {
        throw 'Canvas.Canvas: No canvas object.';
    } else if (!canvasObjects) {
        throw 'Canvas.Canvas: No canvasObjects object.';
    }

    this._canvas = canvas;
    this._left = this._canvas.getBoundingClientRect().left;
    this._top = this._canvas.getBoundingClientRect().top;
    this._ctx = this._canvas.getContext('2d');

    this._hoveredColor = 'lightgrey';
    this._selectedColor = "red";
    this._blackColor = '#000000';
    this._dotColor = "grey";
    this._imaginaryColor = "grey";
    this._intersectionColor = 'black';
    this._questionColor = "red";

    this._dotNameFont = "15px Arial";
    this._valueFont = " 15px Arial";
    this._ordinaryFont = "10px Arial";

    this._dotDiameter = 2;
    this._dotHoveredDiameter = 4;

    this._elements = canvasObjects;
}

Canvas.prototype = {

    drawObjects() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        if (this._elements.dragStartPoint && this._elements.dragDot === null) {
            this.drawLine(
                new Line(this._elements.dragStartPoint, this._elements.currentDot),
                this._imaginaryColor);
        }
        for (let line of this._elements.imaginaryLines) {
            this.drawLine(line, this._imaginaryColor);
        }
        for (let ang of this._elements.angles) {
            this.drawAngle(ang);
        }
        for (let line of this._elements.lines) {
            this.drawLine(line);
        }
        for (let line of this._elements.lines) {
            this.drawLineSegments(line);
        }
        for (let circ of this._elements.circles) {
            this.drawCircle(circ);
        }
        for (let dot of this._elements.dots) {
            this.drawDot(dot);
        }
        for (let intr of this._elements.intersectionDots) {
            this.drawDot(intr, this._intersectionColor, this._dotHoveredDiameter);
        }
        for (let parallel of this._elements.parallelsTemp) {
            this.drawParallel(parallel);
        }
    },

    drawDot(dot, color, diameter) {
        this._ctx.lineWidth = 1;
        if (color) {
            this._ctx.strokeStyle = color;
            this._ctx.fillStyle = color;
        } else {
            this._ctx.strokeStyle = this._blackColor;
            this._ctx.fillStyle = this._blackColor;
        }

        let dotDiameter = diameter ||
            (dot.isHovered() ? this._dotHoveredDiameter : this._dotDiameter);

        this._ctx.beginPath();
        this._ctx.setLineDash([0]);
        this._ctx.arc(dot.getX(), dot.getY(), dotDiameter, 0, 2 * Math.PI);
        this._ctx.closePath();
        this._ctx.fill();
        this._ctx.stroke();

        this._ctx.font = this._valueFont;
        if (color) {
            this._ctx.strokeStyle = color;
            this._ctx.fillStyle = color;
        } else {
            this._ctx.strokeStyle = this._dotColor;
            this._ctx.fillStyle = this._dotColor;
        }

        if (dot.getName()) {
            this._ctx.font = this._dotNameFont;
            let line = this._elements.lines.find((x) => x.isLineEnd(dot));
            let ang = this._elements.angles
                .filter((x) => x.getDot() === dot)
                .reduce(function (acc, x) {
                    if (x.isKnown() && x.getValue() !== 180 || x.getValue() === '?') {
                        return acc;
                    } else if (acc === null) {
                        return x;
                    } else if (acc.getCanvasAngle() < x.getCanvasAngle()) {
                        return x;
                    } else {
                        return acc;
                    }
                }, null);

            let point = getDotNamePoint(dot, ang, line);
            this._ctx.fillText(dot.getName(), point.getX(), point.getY());
        }
    },

    drawLine(line, color) {
        this._ctx.font = this._ordinaryFont;
        this._ctx.fillStyle = this._blackColor;

        this._ctx.strokeStyle = color || this.getColor(line);
        if (line.isHovered()) {
            this._ctx.lineWidth = 3;
        } else {
            this._ctx.lineWidth = 1;
        }
        if (line.getValue()) {
            if (line.getValue() === '?') {
                this._ctx.fillStyle = this._questionColor;
            }
            this._ctx.font = this._valueFont;
            let point = getLineTextPoint(line);
            this._ctx.fillText(`${line.getValue()} cm`, point.getX(), point.getY());
            this._ctx.fill();
        }

        this._ctx.fillStyle = this._blackColor;
        this._ctx.beginPath();
        this._ctx.setLineDash([0]);
        this._ctx.moveTo(line.getX1(), line.getY1());
        this._ctx.lineTo(line.getX2(), line.getY2());
        this._ctx.closePath();
        this._ctx.stroke();

        if (line.getValue()) {
            return;
        }

        let equivalents = this._elements.equivalents.filter((x) => x.getType() === 'Line');
        if (equivalents.length > 0 && equivalents[0].contains(line)) {
            let similarLine = getLineSimilarSymbolLine1(line);
            this._ctx.beginPath();
            this._ctx.setLineDash([0]);
            this._ctx.moveTo(similarLine[0].getX(), similarLine[0].getY());
            this._ctx.lineTo(similarLine[1].getX(), similarLine[1].getY());
            this._ctx.closePath();
            this._ctx.stroke();
        }

        if (equivalents.length > 1 && equivalents[1].contains(line)) {
            let similarLine = getLineSimilarSymbolLine2(line);
            this._ctx.beginPath();
            this._ctx.setLineDash([0]);
            this._ctx.moveTo(similarLine[0].getX(), similarLine[0].getY());
            this._ctx.lineTo(similarLine[1].getX(), similarLine[1].getY());
            this._ctx.moveTo(similarLine[2].getX(), similarLine[2].getY());
            this._ctx.lineTo(similarLine[3].getX(), similarLine[3].getY());
            this._ctx.closePath();
            this._ctx.stroke();
        }
    },

    drawCircle(circ) {
        this._ctx.font = this._ordinaryFont;
        this._ctx.fillStyle = this._blackColor;
        this._ctx.strokeStyle = this._blackColor;

        if (circ.isHovered()) {
            this._ctx.strokeStyle = this._hoveredColor;
            this._ctx.lineWidth = 3;
        } else {
            this._ctx.strokeStyle = this._blackColor;
            this._ctx.lineWidth = 1;
        }

        this._ctx.beginPath();
        let dot = circ.getDot();
        this._ctx.arc(dot.getX(), dot.getY(), circ.getRadius(), 0, 2 * Math.PI);
        this._ctx.stroke();
    },

    drawLineSegments(line) {
        this._ctx.font = this._ordinaryFont;
        this._ctx.fillStyle = this._blackColor;

        for (let seg of line.getSegments()) {
            if (seg.isHovered()) {
                this._ctx.lineWidth = 3;
            } else {
                this._ctx.lineWidth = 1;
            }
            if (seg.getValue()) {
                this._ctx.font = this._valueFont;
                let point = getLineTextPoint(seg);
                this._ctx.fillText(`${seg.getValue()} cm`, point.getX(), point.getY());
            }

            if (seg.isHovered()) {
                this._ctx.beginPath();
                this._ctx.strokeStyle = this.getColor(seg);
                this._ctx.setLineDash([0]);
                this._ctx.moveTo(seg.getX1(), seg.getY1());
                this._ctx.lineTo(seg.getX2(), seg.getY2());
                this._ctx.closePath();
                this._ctx.stroke();
            }
        }
    },

    drawAngle(ang) {
        this._ctx.font = this._ordinaryFont;
        this._ctx.fillStyle = this._blackColor;

        if (ang.getValue()) {
            this._ctx.font = this._valueFont;
            if (ang.getValue() === 90) {
                let points90 = get90DegreeSymbolPoints(ang);
                this._ctx.beginPath();
                this._ctx.setLineDash([0]);
                for (let i = 1; i < points90.length + 1; i++) {
                    let dot1 = points90[(i - 1) % points90.length];
                    let dot2 = points90[i % points90.length];
                    this._ctx.moveTo(dot1.getX(), dot1.getY());
                    this._ctx.lineTo(dot2.getX(), dot2.getY());
                }

                let middleX = (points90[0].getX() + points90[2].getX()) / 2;
                let middleY = (points90[0].getY() + points90[2].getY()) / 2;
                this._ctx.stroke();
                this._ctx.closePath();

                this._ctx.beginPath();
                this._ctx.arc(middleX, middleY, this._dotDiameter / 2, 0, 2 * Math.PI);
                this._ctx.fill();
            } else if (ang.getValue() !== 180) {
                if (ang.getValue() === '?') {
                    this._ctx.fillStyle = this._questionColor;
                }
                let textWidth = this._ctx.measureText(ang.getValue()).width;
                let point = getAngleTextPoint(ang, textWidth);
                this._ctx.fillText(ang.getValueString(), point.getX(), point.getY());
            }
        }

        this._ctx.fillStyle = this.getColor(ang);
        this._ctx.strokeStyle = this._blackColor;

        if (ang.isHovered() || ang.isSelected()) {
            let ang1 = getLineAngleRadian(ang.getLine1(), ang.getDot());
            let ang2 = getLineAngleRadian(ang.getLine2(), ang.getDot());
            this._ctx.beginPath();
            this._ctx.setLineDash([0]);
            this._ctx.arc(ang.getDot().getX(), ang.getDot().getY(), 15, ang1, ang2);
            this._ctx.lineTo(ang.getDot().getX(), ang.getDot().getY());
            this._ctx.fill();
            this._ctx.stroke();
        } else {
            this._ctx.setLineDash([0]);
        }

        if (ang.getValue()) {
            return;
        }

        let equivalents = this._elements.equivalents.filter((x) => x.getType() === 'AngleSum');
        if ((equivalents.length > 0 &&
            equivalents[0].getElements().length > 1 &&
            equivalents[0].getElements().some((x) => x.contains(ang)))) {
            let dotPoint = getAngleSimilarSymbolI(ang);
            this._ctx.beginPath();
            this._ctx.setLineDash([0]);
            this._ctx.arc(dotPoint.getX(), dotPoint.getY(), this._dotDiameter, 0, 2 * Math.PI);
            this._ctx.closePath();
            this._ctx.fill();

            let ang1 = getLineAngleRadian(ang.getLine1(), ang.getDot());
            let ang2 = getLineAngleRadian(ang.getLine2(), ang.getDot());
            this._ctx.beginPath();
            this._ctx.setLineDash([0]);
            this._ctx.arc(ang.getDot().getX(), ang.getDot().getY(), 20, ang1, ang2);
            this._ctx.lineTo(ang.getDot().getX(), ang.getDot().getY());
            this._ctx.stroke();
        }
    },

    drawParallel(parallel) {
        for (let line of parallel) {
            let longLine = getLongLine(line);
            this._ctx.beginPath();
            this._ctx.strokeStyle = this._hoveredColor;
            this._ctx.setLineDash([5, 3]);
            this._ctx.moveTo(longLine.getX1(), longLine.getY1());
            this._ctx.lineTo(longLine.getX2(), longLine.getY2());
            this._ctx.closePath();
            this._ctx.stroke();
        }
    },

    getLeft() {
        return this._left;
    },

    getTop() {
        return this._top;
    },

    getColor(obj) {
        if (obj.isSelected()) {
            return this._selectedColor;
        } else if (obj.isHovered()) {
            return this._hoveredColor;
        } else {
            return this._blackColor;
        }
    },

    update() {
        this.drawObjects();
    }
}

export default Canvas;