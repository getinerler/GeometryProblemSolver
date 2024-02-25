'use strict';

import { getNarrowAngle, linesMatchAngle } from '../../modules/solve/solveCommon.js';
import { areEquivalent } from '../../modules/solve/solveCommon.js';

function SimilarityFinder(triangles, equivalents) {
    this.triangles = triangles;
    this.equivalents = equivalents;
    this.similarTriangles = [];
}

SimilarityFinder.prototype = {

    find() {
        for (let tri1 of this.triangles) {
            for (let tri2 of this.triangles) {
                if (tri1 === tri2) {
                    continue;
                }
                this.findTriangleSimilarity(tri1, tri2);
            }
        }
        return this.similarTriangles;
    },

    findTriangleSimilarity(tri1, tri2) {
        this.findAAASimilarity(tri1, tri2);
        this.findLALSimilarity(tri1, tri2);
        this.findLLLSimilarity(tri1, tri2);
    },

    findAAASimilarity(tri1, tri2) {

    },

    findLLLSimilarity(tri1, tri2) {

    },

    findLALSimilarity(tri1, tri2) {
        for (let ang1 of tri1.getAngles()) {
            for (let ang2 of tri2.getAngles()) {
                if (!this.areEquivalent(ang1, ang2)) {
                    continue;
                }

                let line1a = this.getTriangleLine(tri1, ang1.getLine1());
                let line1b = this.getTriangleLine(tri1, ang1.getLine2());

                let line2a = this.getTriangleLine(tri2, ang2.getLine1());
                let line2b = this.getTriangleLine(tri2, ang2.getLine2());

                if (this.areEquivalent(line1a, line2a) &&
                    this.areEquivalent(line1b, line2b)) {

                } else if (this.areEquivalent(line1a, line2b) &&
                    this.areEquivalent(line1b, line2a)) {
                    let lineTemp = line2a;
                    line2a = line2b;
                    line2b = lineTemp;
                } else {
                    continue;
                }

                let line1c = tri1.getOtherLine(line1a, line1b);
                let line2c = tri2.getOtherLine(line2a, line2b);

                this.similarTriangles.push({
                    tri1: tri1,
                    tri2: tri2,
                    lines1: [line1a, line1b, line1c],
                    lines2: [line2a, line2b, line2c],
                    angles1: [
                        this.getLineAngle(tri1, line1a, line1b),
                        this.getLineAngle(tri1, line1b, line1c),
                        this.getLineAngle(tri1, line1c, line1a)
                    ],
                    angles2: [
                        this.getLineAngle(tri2, line2a, line2b),
                        this.getLineAngle(tri2, line2b, line2c),
                        this.getLineAngle(tri2, line2c, line2a)
                    ]
                });
            }
        }
    },

    getTriangleLine(tri, line) {
        let base = line.getBaseOrSelf();
        for (let triLine of tri.getLines()) {
            if (triLine === line) {
                return triLine;
            }
            if (triLine === base) {
                return base;
            }
            for (let seg of triLine.getSegments()) {
                if (seg === triLine) {
                    return seg;
                }
            }
        }
        return null;
    },

    getNarrowAngle(line1, line2) {
        return getNarrowAngle(this.angles, line1, line2);
    },

    getLineAngle(tri, line1, line2) {
        for (let ang of tri.getAngles()) {
            if (linesMatchAngle(ang, line1, line2)) {
                return ang;
            }
        }
        return null;
    },

    areEquivalent(val1, val2) {
        return areEquivalent(this.equivalents, val1, val2);
    }
}

export default SimilarityFinder;