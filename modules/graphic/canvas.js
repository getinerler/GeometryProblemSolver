'use strict';

import Line from '../../models/graphic/line.js';
import { getLineAngleRadian, getAngleTextPoint, getLineTextPoint } from './geoHelper.js';
import { getLongLine, get90DegreeSymbolPoints, getAngleSimilarSymbolI } from './geoHelper.js';
import { getLineSimilarSymbolLine1, getLineSimilarSymbolLine2 } from './geoHelper.js';

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

    this._hoveredColor = '#FFC0CB';
    this._blackColor = '#000000';
    this._intersectionColor = 'grey';
    this._dotSize = 2;

    this._elements = canvasObjects;
}

Canvas.prototype = {

    drawObjects() {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        if (this._elements.dragStartPoint && this._elements.dragDot === null) {
            let lineToDraw =
                new Line(this._elements.dragStartPoint, this._elements.currentDot)
            this.drawLine(lineToDraw);
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
        for (let dot of this._elements.dots) {
            this.drawDot(dot);
        }
        for (let int of this._elements.intersectionDots) {
            this.drawDot(int, this._intersectionColor);
        }
        for (let parallel of this._elements.parallelsTemp) {
            this.drawParallel(parallel);
        }
    },

    drawDot(dot, color) {
        if (color) {
            this._ctx.fillStyle = color;
        } else if (dot.isHovered()) {
            this._ctx.fillStyle = this._hoveredColor;
        } else {
            this._ctx.fillStyle = this._blackColor;
        }

        this._ctx.beginPath();
        this._ctx.setLineDash([0]);
        this._ctx.arc(dot.getX(), dot.getY(), this._dotSize, 0, 2 * Math.PI);
        this._ctx.closePath();
        this._ctx.fill();

        if (dot.getName()) {
            this._ctx.fillText(dot.getName(), dot.getX() + 5, dot.getY() - 7);
        }

        this._ctx.beginPath();
        this._ctx.setLineDash([0]);
        this._ctx.arc(dot.getX(), dot.getY(), this._dotSize, 0, 2 * Math.PI);
        this._ctx.closePath();
        this._ctx.stroke();
    },

    drawLine(line) {
        if (line.isHovered()) {
            this._ctx.strokeStyle = this._hoveredColor;
        } else {
            this._ctx.strokeStyle = this._blackColor;
        }

        if (line.getValue()) {
            let point = getLineTextPoint(line);
            this._ctx.fillText(`${line.getValue()} cm`, point.getX(), point.getY());
        }

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

    drawLineSegments(line) {
        for (let seg of line.getSegments()) {
            if (seg.getValue()) {
                let point = getLineTextPoint(seg);
                this._ctx.fillText(`${seg.getValue()} cm`, point.getX(), point.getY());
            }

            if (seg.isHovered()) {
                this._ctx.beginPath();
                this._ctx.strokeStyle = this._hoveredColor;
                this._ctx.setLineDash([0]);
                this._ctx.moveTo(seg.getX1(), seg.getY1());
                this._ctx.lineTo(seg.getX2(), seg.getY2());
                this._ctx.closePath();
                this._ctx.stroke();
            }
        }
    },

    drawAngle(ang) {
        if (ang.getValue()) {
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
                this._ctx.arc(middleX, middleY, this._dotSize / 2, 0, 2 * Math.PI);
                this._ctx.fill();
            } else if (ang.getValue() !== 180) {
                let textWidth = this._ctx.measureText(ang.getValue()).width;
                let point = getAngleTextPoint(ang, textWidth);
                this._ctx.fillText(ang.getValue(), point.getX(), point.getY());
            }
        }

        if (ang.isHovered()) {
            this._ctx.fillStyle = this._hoveredColor;
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
            this._ctx.strokeStyle = this._blackColor;
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
            this._ctx.arc(dotPoint.getX(), dotPoint.getY(), this._dotSize, 0, 2 * Math.PI);
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

    getValueObject() {
        let obj = this.valueObject;
        this.valueObject = null;
        return obj;
    },

    update() {
        this.drawObjects();
    }
}

export default Canvas;