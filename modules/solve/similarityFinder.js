'use strict';

import Similarity from '../../models/solve/similarity.js';
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
        let older = this.similarTriangles.find((x) => x.has(tri1) && x.has(tri2));
        if (older) {
            return;
        }
        this.findAAASimilarity(tri1, tri2);
        this.findLALSimilarity(tri1, tri2);
        this.findLLLSimilarity(tri1, tri2);
    },

    findAAASimilarity(tri1, tri2) {
        let len = 3;
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len; j++) {
                let ang1a = tri1.getAngle(i);
                let ang1b = tri1.getAngle((i + 1) % len);
                let ang2a = tri2.getAngle(j);
                let ang2b = tri2.getAngle((j + 1) % len);

                if (this.areEquivalent(ang1a, ang2a) && this.areEquivalent(ang1b, ang2b)) {

                } else if (this.areEquivalent(ang1a, ang2b) && this.areEquivalent(ang1b, ang2a)) {
                    let temp = ang2a;
                    ang2a = ang2b;
                    ang2b = temp;
                } else {
                    continue;
                }

                let ang1c = tri1.getAngles().find((x) => x !== ang1a && x !== ang1b);
                let ang2c = tri2.getAngles().find((x) => x !== ang2a && x !== ang2b);

                let line1a = this.getAnglesLine(tri1, ang1a, ang1b);
                let line1b = this.getAnglesLine(tri1, ang1b, ang1c);
                let line1c = this.getAnglesLine(tri1, ang1c, ang1a);

                let line2a = this.getAnglesLine(tri2, ang2a, ang2b);
                let line2b = this.getAnglesLine(tri2, ang2b, ang2c);
                let line2c = this.getAnglesLine(tri2, ang2c, ang2a);

                let similarity = new Similarity({
                    triangle1: tri1,
                    triangle2: tri2,
                    lines1: [line1a, line1b, line1c],
                    lines2: [line2a, line2b, line2c],
                    angles1: [ang1a, ang1b, ang1c],
                    angles2: [ang2a, ang2b, ang2c]
                });

                this.similarTriangles.push(similarity);
            }
        }
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

                let similar = new Similarity({
                    triangle1: tri1,
                    triangle2: tri2,
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
                this.similarTriangles.push(similar);
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

    getAnglesLine(tri, ang1, ang2) {
        if (tri.getAngle(0) === ang1 && tri.getAngle(1) === ang2 ||
            tri.getAngle(0) === ang2 && tri.getAngle(1) === ang1) {
            return tri.getLine(0);
        }
        if (tri.getAngle(1) === ang1 && tri.getAngle(2) === ang2 ||
            tri.getAngle(1) === ang2 && tri.getAngle(2) === ang1) {
            return tri.getLine(1);
        }
        if (tri.getAngle(2) === ang1 && tri.getAngle(0) === ang2 ||
            tri.getAngle(2) === ang2 && tri.getAngle(0) === ang1) {
            return tri.getLine(2);
        }
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