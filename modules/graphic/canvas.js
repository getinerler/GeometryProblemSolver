'use strict';

import Line from '../../models/graphic/line.js';
import { getLineAngleRadian, getAngleTextPoint, getLineTextPoint } from './geoHelper.js';
import { getLongLine, get90DegreeSymbolPoints } from './geoHelper.js';

function Canvas(canvas, canvasObjects) {
    if (!canvas) {
        throw 'Canvas.Canvas: No canvas object.';
    }
    if (!canvasObjects) {
        throw 'Canvas.Canvas: No canvasObjects object.';
    }

    this.left = canvas.getBoundingClientRect().left;
    this.top = canvas.getBoundingClientRect().top;
    this.ctx = canvas.getContext('2d');

    this.hoveredColor = '#FFC0CB';
    this.blackColor = '#000000';
    this.intersectionColor = 'grey';
    this.dotSize = 2;

    this.elements = canvasObjects;
}

Canvas.prototype = {

    drawObjects() {
        this.ctx.clearRect(0, 0, 500, 500);
        if (this.elements.dragStartPoint && this.elements.dragDot === null) {
            let lineToDraw =
                new Line(this.elements.dragStartPoint, this.elements.currentDot)
            this.drawLine(lineToDraw);
        }
        for (let ang of this.elements.angles) {
            this.drawAngle(ang);
        }
        for (let line of this.elements.lines) {
            this.drawLine(line);
        }
        for (let line of this.elements.lines) {
            this.drawLineSegments(line);
        }
        for (let dot of this.elements.dots) {
            this.drawDot(dot);
        }
        for (let int of this.elements.intersectionDots) {
            this.drawDot(int, this.intersectionColor);
        }
        for (let parallel of this.elements.parallelsTemp) {
            this.drawParallel(parallel);
        }
    },

    drawDot(dot, color) {
        if (color) {
            this.ctx.fillStyle = color;
        } else if (dot.isHovered()) {
            this.ctx.fillStyle = this.hoveredColor;
        } else {
            this.ctx.fillStyle = this.blackColor;
        }

        this.ctx.beginPath();
        this.ctx.setLineDash([0]);
        this.ctx.arc(dot.getX(), dot.getY(), this.dotSize, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();

        if (dot.getName()) {
            this.ctx.fillText(dot.getName(), dot.getX() + 5, dot.getY() - 7);
        }

        this.ctx.beginPath();
        this.ctx.setLineDash([0]);
        this.ctx.arc(dot.getX(), dot.getY(), this.dotSize, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.stroke();
    },

    drawLine(line) {
        if (line.isHovered()) {
            this.ctx.strokeStyle = this.hoveredColor;
        } else {
            this.ctx.strokeStyle = this.blackColor;
        }

        if (line.getValue()) {
            let point = getLineTextPoint(line);
            this.ctx.fillText(`${line.getValue()} cm`, point.getX(), point.getY());
        }

        this.ctx.beginPath();
        this.ctx.setLineDash([0]);
        this.ctx.moveTo(line.getX1(), line.getY1());
        this.ctx.lineTo(line.getX2(), line.getY2());
        this.ctx.closePath();
        this.ctx.stroke();
    },

    drawLineSegments(line) {
        for (let seg of line.getSegments()) {
            if (seg.getValue()) {
                let point = getLineTextPoint(seg);
                this.ctx.fillText(`${seg.getValue()} cm`, point.getX(), point.getY());
            }

            if (seg.isHovered()) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.hoveredColor;
                this.ctx.setLineDash([0]);
                this.ctx.moveTo(seg.getX1(), seg.getY1());
                this.ctx.lineTo(seg.getX2(), seg.getY2());
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
    },

    drawAngle(ang) {
        if (ang.getValue()) {
            if (ang.getValue() === 90) {
                let points90 = get90DegreeSymbolPoints(ang);
                this.ctx.beginPath();
                this.ctx.setLineDash([0]);
                for (let i = 1; i < points90.length + 1; i++) {
                    let dot1 = points90[(i - 1) % points90.length];
                    let dot2 = points90[i % points90.length];
                    this.ctx.moveTo(dot1.getX(), dot1.getY());
                    this.ctx.lineTo(dot2.getX(), dot2.getY());
                }

                let middleX = (points90[0].getX() + points90[2].getX()) / 2;
                let middleY = (points90[0].getY() + points90[2].getY()) / 2;
                this.ctx.stroke();
                this.ctx.closePath();

                this.ctx.beginPath();
                this.ctx.arc(middleX, middleY, this.dotSize / 2, 0, 2 * Math.PI);
                this.ctx.fill();
            } else {
                let textWidth = this.ctx.measureText(ang.getValue()).width;
                let point = getAngleTextPoint(ang, textWidth);
                this.ctx.fillText(ang.getValue(), point.getX(), point.getY());
            }
        }
        
        if (ang.isHovered()) {
            this.ctx.fillStyle = this.hoveredColor;
            let ang1 = getLineAngleRadian(ang.getLine1(), ang.getDot());
            let ang2 = getLineAngleRadian(ang.getLine2(), ang.getDot());
            this.ctx.beginPath();
            this.ctx.setLineDash([0]);
            this.ctx.arc(ang.getDot().getX(), ang.getDot().getY(), 15, ang1, ang2);
            this.ctx.lineTo(ang.getDot().getX(), ang.getDot().getY());
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.setLineDash([0]);
            this.ctx.strokeStyle = this.blackColor;
        }
    },

    drawParallel(parallel) {
        for (let line of parallel) {
            let longLine = getLongLine(line);
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.hoveredColor;
            this.ctx.setLineDash([5, 3]);
            this.ctx.moveTo(longLine.getX1(), longLine.getY1());
            this.ctx.lineTo(longLine.getX2(), longLine.getY2());
            this.ctx.closePath();
            this.ctx.stroke();
        }
    },

    getLeft() {
        return this.left;
    },

    getTop() {
        return this.top;
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