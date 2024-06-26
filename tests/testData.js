'use strict';

import Dot from '../models/graphic/dot.js';
import Line from '../models/graphic/line.js';
import Angle from '../models/graphic/angle.js';
import Parallel from '../models/graphic/parallel.js';
import Value from '../models/equations/value.js';
import Equivalence from '../models/graphic/equivalence.js';
import AngleSum from '../models/solve/angleSum.js';

const TestData = {

    getLineSegmentSumQuestion: {
        'name': 'Find segment',
        'explanation': 'Question: Find line segment\'s length.',
        'result': [new Value(6)],
        getQuestion() {
            let dots = [
                new Dot(345, 253, 'A'),
                new Dot(60, 69, 'B'),
                new Dot(202.5997146785354, 161.06437719596673, 'C')
            ];

            let seg1 = new Line(dots[0], dots[2]);
            let seg2 = new Line(dots[2], dots[1]);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2).setValue(10)
            ];

            seg1.setValue(4).setBase(lines[0]);
            seg2.setValue('?').setBase(lines[0]);

            return {
                dots,
                lines,
                angles: [],
                parallels: [],
                equivalents: [],
                question: seg2
            };
        }
    },

    getSupplementaryAnglesQuestion: {
        'name': 'Supp. angles',
        'explanation': 'Question: Find supplementary angle (120 + x = 180).',
        'result': [new Value(60)],
        getQuestion() {
            let dots = [
                new Dot(373, 199, 'A'),
                new Dot(52, 196, 'B'),
                new Dot(300, 46, 'C'),
                new Dot(207.99508515987353, 197.45789799214836, 'D')
            ];

            let seg1 = new Line(dots[0], dots[3]);
            let seg2 = new Line(dots[3], dots[1]);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2),
                new Line(dots[2], dots[3])
            ];

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);

            dots[3].setBaseLine(lines[1]).setLineRatio(0.5140340026172164);

            let angles = [
                new Angle(dots[3], seg1, seg2),
                new Angle(dots[3], seg2, lines[1]).setValue(120),
                new Angle(dots[3], lines[1], seg1).setValue('?')
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[2]
            };
        }
    },

    getSupplementaryAngleQuestion2: {
        'name': 'Supp. angles 2',
        'explanation': 'Question: Find supplementary angle on intersection (50 + x = 180).',
        'result': [new Value(130)],
        getQuestion() {
            let dots = [
                new Dot(86, 74, 'A'),
                new Dot(346, 256, 'B'),
                new Dot(341, 88, 'C'),
                new Dot(70, 237, 'D'),
                new Dot(209.38057277826985, 160.3664009447889, 'E')
            ];

            let seg1 = new Line(dots[0], dots[4]);
            let seg2 = new Line(dots[4], dots[1]);
            let seg3 = new Line(dots[2], dots[4]);
            let seg4 = new Line(dots[4], dots[3]);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2),
                new Line(dots[2], dots[3]).addSegment(seg3).addSegment(seg4)
            ];

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);
            seg3.setBase(lines[1]);
            seg4.setBase(lines[1]);

            dots[4].setIntersectionLines([seg1, seg2, seg3, seg4]);

            let angles = [
                new Angle(dots[4], seg2, seg4),
                new Angle(dots[4], seg4, seg1),
                new Angle(dots[4], seg1, seg3).setValue(50),
                new Angle(dots[4], seg3, seg2).setValue('?')
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[3]
            };
        }
    },

    getRoundAngleQuestion: {
        'name': 'Round angles',
        'explanation': 'Question: Round angle sum (120 + 80 + x + 60).',
        'result': [new Value(120)],
        getQuestion() {
            let dots = [
                new Dot(89, 67, 'A'),
                new Dot(392, 266, 'B'),
                new Dot(324, 93, 'C'),
                new Dot(92, 282, 'D'),
                new Dot(237, 164, 'E')
            ];

            let lines = [
                new Line(dots[0], dots[1]),
                new Line(dots[2], dots[3])
            ];

            dots[4].setIntersectionLines([lines[0], lines[1]]);

            let imgLines = [
                new Line(dots[4], dots[0], ''),
                new Line(dots[4], dots[1], ''),
                new Line(dots[4], dots[2], ''),
                new Line(dots[4], dots[3], '')
            ];

            let angles = [
                new Angle(dots[4], imgLines[1], imgLines[3]).setValue(120),
                new Angle(dots[4], imgLines[3], imgLines[0]),
                new Angle(dots[4], imgLines[0], imgLines[2]).setValue('?'),
                new Angle(dots[4], imgLines[2], imgLines[1])
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[2]
            };
        }
    },

    getInteriorAnglesQuestion: {
        'name': 'Interior angles',
        'explanation': 'Question: Find interior angle (80 + x).',
        'result': [new Value(100)],
        getQuestion() {
            let dots = [
                new Dot(369, 101, 'A'),
                new Dot(75, 102, 'B'),
                new Dot(361, 300, 'D'),
                new Dot(153, 299, 'C')
            ];

            let lines = [
                new Line(dots[0], dots[1]),
                new Line(dots[2], dots[3]),
                new Line(dots[3], dots[1])
            ];

            let angles = [
                new Angle(dots[1], lines[0], lines[2]).setValue(80),
                new Angle(dots[1], lines[2], lines[0]),
                new Angle(dots[3], lines[1], lines[2]),
                new Angle(dots[3], lines[2], lines[1]).setValue('?')
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [new Parallel([lines[0], lines[1]])],
                equivalents: [],
                question: angles[3]
            };
        },
    },

    getInteriorAngles2Question: {
        'name': 'Interior angles 2',
        'explanation': 'Question: Find interior angle (50 + x = 180).',
        'result': [new Value(130)],
        getQuestion() {
            let dots = [
                new Dot(384, 127, 'A'),
                new Dot(48, 126, 'B'),
                new Dot(384, 287, 'C'),
                new Dot(41, 284, 'D'),
                new Dot(298, 44, 'E'),
                new Dot(136, 388, 'F'),
                new Dot(259.0878648074231, 126.62823769287924, 'G'),
                new Dot(184.3861476392242, 285.2541062475734, 'H')
            ];

            let seg1 = new Line(dots[0], dots[6]);
            let seg2 = new Line(dots[6], dots[1]);
            let seg3 = new Line(dots[2], dots[7]);
            let seg4 = new Line(dots[7], dots[3]);
            let seg5 = new Line(dots[4], dots[6]);
            let seg6 = new Line(dots[6], dots[7]);
            let seg7 = new Line(dots[7], dots[5]);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2),
                new Line(dots[2], dots[3]).addSegment(seg3).addSegment(seg4),
                new Line(dots[4], dots[5]).addSegment(seg5).addSegment(seg6).addSegment(seg7)
            ];

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);
            seg3.setBase(lines[1]);
            seg4.setBase(lines[1]);
            seg5.setBase(lines[2]);
            seg6.setBase(lines[2]);
            seg7.setBase(lines[2]);

            dots[6].setIntersectionLines([seg1, seg5, seg6, seg2]);
            dots[7].setIntersectionLines([seg7, seg3, seg6, seg4]);

            let angles = [
                new Angle(dots[6], seg6, seg2),
                new Angle(dots[6], seg2, seg5),
                new Angle(dots[6], seg5, seg1).setValue(50),
                new Angle(dots[6], seg1, seg6),
                new Angle(dots[7], seg3, seg7).setValue('?'),
                new Angle(dots[7], seg7, seg4),
                new Angle(dots[7], seg4, seg6),
                new Angle(dots[7], seg6, seg3)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [new Parallel([lines[0], lines[1]])],
                equivalents: [],
                question: angles[4]
            };
        }
    },

    getCorrespAngle2Question: {
        'name': 'Reverse angles 2',
        'explanation': 'Question: Find reverse angle (x = 70).',
        'result': [new Value(70)],
        getQuestion() {
            let dots = [
                new Dot(51, 92, 'A'),
                new Dot(353, 93, 'B'),
                new Dot(350, 316, 'D'),
                new Dot(47, 317, 'C')
            ];

            let lines = [
                new Line(dots[0], dots[1]),
                new Line(dots[3], dots[1]),
                new Line(dots[2], dots[3])
            ];

            let angles = [
                new Angle(dots[1], lines[0], lines[1]),
                new Angle(dots[1], lines[1], lines[0]).setValue(70),
                new Angle(dots[3], lines[1], lines[2]).setValue('?'),
                new Angle(dots[3], lines[2], lines[1])
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [new Parallel([lines[0], lines[2]])],
                equivalents: [],
                question: angles[2]
            };
        }
    },

    getTriangleAngleQuestion: {
        'name': 'Triangle angle',
        'explanation': 'Question: Find triangle missing angle (70 + 80 + x = 180).',
        'result': [new Value(30)],
        getQuestion() {
            //A, B, C
            let dots = [
                new Dot(224, 73),
                new Dot(121, 214),
                new Dot(329, 232)
            ];

            //AB, BC, CA
            let lines = [
                new Line(dots[0], dots[1]),
                new Line(dots[1], dots[2]),
                new Line(dots[2], dots[0])
            ];

            let angles = [
                new Angle(dots[0], lines[2], lines[0]).setValue(70),
                new Angle(dots[0], lines[0], lines[2]),
                new Angle(dots[1], lines[0], lines[1]).setValue(80),
                new Angle(dots[1], lines[1], lines[0]),
                new Angle(dots[2], lines[1], lines[2]).setValue('?'),
                new Angle(dots[2], lines[2], lines[1])
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[4]
            };
        }
    },

    getTriangleAngleQuestion2: {
        'name': 'Triangle angle 2',
        'explanation': 'Question: Find triangle\'s missing angle.',
        'result': [new Value(60)],
        getQuestion() {
            let dots = [
                new Dot(213, 48, 'A'),
                new Dot(45, 178, 'B'),
                new Dot(396, 184, 'C'),
                new Dot(280, 371, 'D'),
                new Dot(240.93243653914914, 182.65935824097255, 'E')
            ];

            let seg1 = new Line(dots[2], dots[4]);
            let seg2 = new Line(dots[4], dots[1]);
            let seg3 = new Line(dots[4], dots[3]);
            let seg4 = new Line(dots[4], dots[0]);

            let lines = [
                new Line(dots[0], dots[1]),
                new Line(dots[2], dots[1]).addSegment(seg1).addSegment(seg2),
                new Line(dots[3], dots[0]).addSegment(seg3).addSegment(seg4),
                new Line(dots[2], dots[3])
            ];

            dots[4].setIntersectionLines([lines[1], lines[2]]);

            seg1.setBase(lines[1]);
            seg2.setBase(lines[1]);
            seg3.setBase(lines[2]);
            seg4.setBase(lines[2]);

            let angles = [
                new Angle(dots[1], lines[0], seg2).setValue(40),
                new Angle(dots[1], seg2, lines[0]),
                new Angle(dots[0], lines[0], seg4),
                new Angle(dots[0], seg4, lines[0]).setValue(95),
                new Angle(dots[3], seg3, lines[3]).setValue('?'),
                new Angle(dots[3], lines[3], seg3),
                new Angle(dots[2], seg1, lines[3]),
                new Angle(dots[2], lines[3], seg1).setValue(75),
                new Angle(dots[4], seg1, seg3),
                new Angle(dots[4], seg3, seg2),
                new Angle(dots[4], seg2, seg4),
                new Angle(dots[4], seg4, seg1)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[4]
            };
        }
    },

    getTriangleAngleQuestion3: {
        'name': 'Triangle angle 3',
        'explanation': 'Question: Find segment triangle\'s missing angle (70 + 80 + x = 180).',
        'result': [new Value(90)],
        getQuestion() {
            let dots = [
                new Dot(251, 43, 'A'),
                new Dot(40, 246, 'B'),
                new Dot(365, 265, 'C'),
                new Dot(401, 191, 'D'),
                new Dot(43, 160, 'E'),
                new Dot(122.25577226535378, 166.8629300006312, 'F'),
                new Dot(323.5563719680809, 184.29398751678912, 'G')
            ];

            let seg1 = new Line(dots[0], dots[5]);
            let seg2 = new Line(dots[5], dots[1]);
            let seg3 = new Line(dots[2], dots[6]);
            let seg4 = new Line(dots[6], dots[0]);
            let seg5 = new Line(dots[5], dots[4]);
            let seg6 = new Line(dots[3], dots[6]);
            let seg7 = new Line(dots[6], dots[5]);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2),
                new Line(dots[2], dots[0]).addSegment(seg3).addSegment(seg4),
                new Line(dots[3], dots[4]).addSegment(seg5).addSegment(seg6).addSegment(seg7)
            ]

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);
            seg3.setBase(lines[1]);
            seg4.setBase(lines[1]);
            seg5.setBase(lines[2]);
            seg6.setBase(lines[2]);
            seg7.setBase(lines[2]);

            let angles = [
                new Angle(dots[0], seg1, seg4),
                new Angle(dots[0], seg4, seg1).setValue('?'),
                new Angle(dots[5], seg7, seg2),
                new Angle(dots[5], seg2, seg5),
                new Angle(dots[5], seg5, seg1),
                new Angle(dots[5], seg1, seg7).setValue(50),
                new Angle(dots[6], seg6, seg3),
                new Angle(dots[6], seg3, seg7),
                new Angle(dots[6], seg7, seg4).setValue(40),
                new Angle(dots[6], seg4, seg6)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[1]
            };
        }
    },

    getTriangleAngleQuestion4: {
        'name': 'Triangle angle 4',
        'explanation': 'Question: Find triangle\'s missing angle (50 + (180 - 70 - 40) + x = 180).',
        'result': [new Value(60)],
        getQuestion() {
            let dots = [
                new Dot(238, 41, 'A'),
                new Dot(51, 241, 'B'),
                new Dot(373, 255, 'C'),
                new Dot(302.6668704409358, 143.50896499526118, 'E'),
                new Dot(211.84199128313574, 247.9931300557885, 'F')
            ];

            let seg1 = new Line(dots[2], dots[3]);
            let seg2 = new Line(dots[3], dots[0]);
            let seg3 = new Line(dots[2], dots[4]);
            let seg4 = new Line(dots[4], dots[1]);

            let lines = [
                new Line(dots[0], dots[1]),
                new Line(dots[2], dots[0]).addSegment(seg1).addSegment(seg2),
                new Line(dots[2], dots[1]).addSegment(seg3).addSegment(seg4),
                new Line(dots[3], dots[4])
            ];

            seg1.setBase(lines[1]);
            seg2.setBase(lines[1]);
            seg3.setBase(lines[2]);
            seg4.setBase(lines[2]);

            dots[3].setBaseLine(lines[1]).setLineRatio(0.520986144881957);
            dots[4].setBaseLine(lines[2]).setLineRatio(0.5004907103008207);

            let angles = [
                new Angle(dots[0], lines[0], seg2),
                new Angle(dots[0], seg2, lines[0]).setValue(50),
                new Angle(dots[1], lines[0], seg4).setValue('?'),
                new Angle(dots[1], seg4, lines[0]),
                new Angle(dots[2], seg1, seg3),
                new Angle(dots[2], seg3, seg1),
                new Angle(dots[4], seg3, seg4),
                new Angle(dots[4], seg4, lines[3]),
                new Angle(dots[4], lines[3], seg3).setValue(40),
                new Angle(dots[3], seg1, lines[3]).setValue(70),
                new Angle(dots[3], lines[3], seg2),
                new Angle(dots[3], seg2, seg1)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[2]
            };
        }
    },

    getTriangleAngleQuestion5: {
        'name': 'Triangle angle 5',
        'explanation': 'Question: Find triangle\'s missing angle (60 + 50 + (20 + x) = 180).',
        'result': [new Value(50)],
        getQuestion() {
            let dots = [
                new Dot(253, 48, 'A'),
                new Dot(69, 238, 'B'),
                new Dot(363, 259, 'C'),
                new Dot(167.01466694753722, 136.78920260852135, 'F')
            ];

            let seg1 = new Line(dots[0], dots[3]);
            let seg2 = new Line(dots[3], dots[1]);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2),
                new Line(dots[2], dots[0]),
                new Line(dots[2], dots[1]),
                new Line(dots[2], dots[3])
            ];

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);
            dots[3].setBaseLine(lines[1]).setLineRatio(0.46731159267642813);

            let angles = [
                new Angle(dots[0], seg1, lines[1]),
                new Angle(dots[0], lines[1], seg1).setValue(50),
                new Angle(dots[1], seg2, lines[2]).setValue(60),
                new Angle(dots[1], lines[2], seg2),
                new Angle(dots[3], lines[3], seg2),
                new Angle(dots[3], seg2, seg1).setValue(180),
                new Angle(dots[3], seg1, lines[3]),
                new Angle(dots[2], lines[1], lines[2]),
                new Angle(dots[2], lines[2], lines[3]).setValue('?'),
                new Angle(dots[2], lines[3], lines[1]).setValue(20)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[8]
            };
        }
    },

    getIsoscelesTriangleLineQuestion6: {
        'name': 'Triangle angle 6',
        'explanation': 'Question: Find triangle\'s missing angle (60 + 50 + (20 + x) = 180).',
        'result': [new Value(70)],
        getQuestion() {
            let dots = [
                new Dot(240, 79, 'A'),
                new Dot(47, 293, 'B'),
                new Dot(369, 328, 'C'),
                new Dot(320.833293799811, 235.02705547405378, 'E'),
                new Dot(106.99130615735476, 226.48114239547192, 'F'),
                new Dot(286.45517021556344, 168.6692820439946, 'G'),
                new Dot(156.96142689087776, 171.07385826607333, 'H')
            ];
            let seg1 = new Line(dots[1], dots[4]);
            let seg2 = new Line(dots[0], dots[6]);
            let seg3 = new Line(dots[4], dots[6]);
            let seg4 = new Line(dots[2], dots[3]);
            let seg5 = new Line(dots[5], dots[3]);
            let seg6 = new Line(dots[5], dots[0]);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2).addSegment(seg3),
                new Line(dots[2], dots[0]).addSegment(seg4).addSegment(seg5).addSegment(seg6),
                new Line(dots[2], dots[1]),
                new Line(dots[3], dots[4]),
                new Line(dots[5], dots[6])
            ];

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);
            seg3.setBase(lines[0]);
            seg4.setBase(lines[1]);
            seg5.setBase(lines[1]);
            seg6.setBase(lines[1]);

            dots[3].setBaseLine(lines[2]).setLineRatio(0.2916192177936231);
            dots[4].setBaseLine(lines[1]).setLineRatio(0.6302432735594624);
            dots[5].setBaseLine(lines[2]).setLineRatio(0.5498567274287088);
            dots[6].setBaseLine(lines[1]).setLineRatio(0.562536890165287);

            let angles = [
                new Angle(dots[0], seg2, seg6),
                new Angle(dots[0], seg6, seg2).setValue('?'),
                new Angle(dots[1], seg1, lines[2]),
                new Angle(dots[1], lines[2], seg1),
                new Angle(dots[2], seg4, lines[2]),
                new Angle(dots[2], lines[2], seg4),
                new Angle(dots[4], lines[3], seg1),
                new Angle(dots[4], seg1, seg3).setValue(180),
                new Angle(dots[4], seg3, lines[3]).setValue(50),
                new Angle(dots[3], seg4, lines[3]),
                new Angle(dots[3], lines[3], seg5).setValue(60),
                new Angle(dots[3], seg5, seg4).setValue(180),
                new Angle(dots[6], lines[4], seg3),
                new Angle(dots[6], seg3, seg2).setValue(180),
                new Angle(dots[6], seg2, lines[4]),
                new Angle(dots[5], seg5, lines[4]),
                new Angle(dots[5], lines[4], seg6),
                new Angle(dots[5], seg6, seg5).setValue(180)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[1]
            };
        }
    },

    getIsoscelesTriangleLineQuestion: {
        'name': 'Isc. triangle line',
        'explanation': 'Question: Find isosceles triangle line.',
        'result': [new Value(10)],
        getQuestion() {
            let dots = [
                new Dot(244, 58, 'A'),
                new Dot(69, 244, 'B'),
                new Dot(364, 255, 'C')
            ];

            let lines = [
                new Line(dots[0], dots[1]).setValue(10),
                new Line(dots[2], dots[0]).setValue('?'),
                new Line(dots[2], dots[1])
            ];

            let angles = [
                new Angle(dots[0], lines[0], lines[1]),
                new Angle(dots[0], lines[1], lines[0]),
                new Angle(dots[1], lines[0], lines[2]),
                new Angle(dots[1], lines[2], lines[0]),
                new Angle(dots[2], lines[1], lines[2]),
                new Angle(dots[2], lines[2], lines[1])
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [new Equivalence([angles[2], angles[5]])],
                question: lines[1]
            };
        }
    },

    getIsoscelesTriangleLineQuestion2: {
        'name': 'Isc. triangle angle',
        'explanation': 'Question: Find isosceles triangle angle.',
        'result': [new Value(50)],
        getQuestion() {
            let dots = [
                new Dot(244, 58, 'A'),
                new Dot(69, 244, 'B'),
                new Dot(364, 255, 'C')
            ];

            let lines = [
                new Line(dots[0], dots[1]),
                new Line(dots[2], dots[0]),
                new Line(dots[2], dots[1])
            ];

            let angles = [
                new Angle(dots[0], lines[0], lines[1]),
                new Angle(dots[0], lines[1], lines[0]),
                new Angle(dots[1], lines[0], lines[2]).setValue(50),
                new Angle(dots[1], lines[2], lines[0]),
                new Angle(dots[2], lines[1], lines[2]),
                new Angle(dots[2], lines[2], lines[1]).setValue('?')
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [new Equivalence([lines[0], lines[1]])],
                question: angles[5]
            };
        }
    },

    getPythagoreanQuestion: {
        'name': 'Find hypotenuse',
        'explanation': 'Question: Find Hypotenuse (3² + 4² = x²).',
        'result': [new Value(5)],
        getQuestion() {
            let dots = [
                new Dot(139, 54),
                new Dot(137, 263),
                new Dot(284, 263)
            ];

            let lines = [
                new Line(dots[0], dots[1], 3),
                new Line(dots[1], dots[2], 4),
                new Line(dots[2], dots[0], '?')
            ];

            let angles = [
                new Angle(dots[0], lines[0], lines[2]),
                new Angle(dots[0], lines[2], lines[0]),
                new Angle(dots[2], lines[2], lines[1]),
                new Angle(dots[2], lines[1], lines[2]),
                new Angle(dots[1], lines[0], lines[1]).setValue(90),
                new Angle(dots[1], lines[1], lines[0])
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: lines[2]
            };
        }
    },

    getGeometricMeanTheoremQuestion: {
        'name': 'Mean Theorem',
        'explanation': 'Question: Geometric Mean Theorem, find height (x² = 8 x 2).',
        'result': [new Value(4)],
        getQuestion() {
            let dots = [
                new Dot(314, 102, 'A'),
                new Dot(65, 246, 'B'),
                new Dot(409, 251, 'C'),
                new Dot(305.00617685415034, 249.4884618728801, 'E')
            ];

            let seg1 = new Line(dots[2], dots[3]).setValue(8); // CE
            let seg2 = new Line(dots[3], dots[1]).setValue(2); // EB

            let lines = [
                new Line(dots[0], dots[1]), // AB
                new Line(dots[2], dots[0]), // CA
                new Line(dots[2], dots[1]).addSegment(seg1).addSegment(seg2),// CB
                new Line(dots[0], dots[3]).setValue('?') // EA
            ];

            seg1.setBase(lines[2]);
            seg2.setBase(lines[2]);

            dots[3].setBaseLine(lines[2]).setLineRatio(0.30408818029244494);

            let angles = [
                new Angle(dots[1], lines[0], seg2),
                new Angle(dots[1], seg2, lines[0]),
                new Angle(dots[2], lines[1], seg1),
                new Angle(dots[2], seg1, lines[1]),
                new Angle(dots[0], lines[0], lines[1]),
                new Angle(dots[0], lines[1], lines[3]),
                new Angle(dots[0], lines[3], lines[0]),
                new Angle(dots[3], seg1, seg2).setValue(180),
                new Angle(dots[3], seg2, lines[3]),
                new Angle(dots[3], lines[3], seg1).setValue(90),
                new Angle(dots[0], lines[1], lines[0]).setValue(90)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: lines[3]
            };
        }
    },

    getAngleBisectorQuestion: {
        'name': 'Angle bisector',
        'explanation': 'Question: Angle bisector line (10/5 = 12/x).',
        'result': [new Value(5)],
        getQuestion() {
            let dots = [
                new Dot(268, 79, 'A'),
                new Dot(73, 283, 'B'),
                new Dot(390, 302, 'C'),
                new Dot(232.2546124037758, 292.5452291346112, 'F')
            ];

            let seg1 = new Line(dots[2], dots[3]); // CF
            let seg2 = new Line(dots[3], dots[1]); // FB

            let lines = [
                new Line(dots[0], dots[1]).setValue(10), // AB
                new Line(dots[2], dots[0]).setValue(12), // CA
                new Line(dots[2], dots[1]).addSegment(seg1).addSegment(seg2), //CB
                new Line(dots[0], dots[3]) // AF
            ];

            seg1.setBase(lines[2]).setValue(6);
            seg2.setBase(lines[2]).setValue('?');

            dots[3].setBaseLine(lines[2]).setLineRatio(0.5000121939818654);

            let angles = [
                new Angle(dots[1], lines[0], seg2),
                new Angle(dots[1], seg2, lines[0]),
                new Angle(dots[2], lines[1], seg1),
                new Angle(dots[2], seg1, lines[1]),
                new Angle(dots[3], seg2, lines[3]),
                new Angle(dots[3], lines[3], seg1),
                new Angle(dots[3], seg1, seg2).setValue(180),
                new Angle(dots[0], lines[0], lines[1]),
                new Angle(dots[0], lines[1], lines[3]),
                new Angle(dots[0], lines[3], lines[0])
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [
                    new Equivalence([new AngleSum(angles[8]), new AngleSum(angles[9])])
                ],
                question: seg2
            }
        }
    },

    getRectangleAngleQuestion: {
        'name': 'Find rect. angle',
        'explanation': 'Question: Find rectangle missing angle (50 + 100 + 120 + x = 360).',
        'result': [new Value(90)],
        getQuestion() {
            let dots = [
                new Dot(85, 100),
                new Dot(80, 241),
                new Dot(325, 238),
                new Dot(325, 100)
            ];

            let lines = [
                new Line(dots[0], dots[1]),
                new Line(dots[1], dots[2]),
                new Line(dots[2], dots[3]),
                new Line(dots[3], dots[0])
            ];

            let angles = [
                new Angle(dots[0], lines[0], lines[3]),
                new Angle(dots[0], lines[3], lines[0]).setValue(50),
                new Angle(dots[1], lines[0], lines[1]).setValue(100),
                new Angle(dots[1], lines[1], lines[0]),
                new Angle(dots[2], lines[1], lines[2]).setValue(120),
                new Angle(dots[2], lines[2], lines[1]),
                new Angle(dots[3], lines[3], lines[2]),
                new Angle(dots[3], lines[2], lines[3]).setValue('?')
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[7]
            };
        }
    },

    getRectangleAngleSegmentQuestion: {
        'name': 'Find rect. angle 2',
        'explanation': 'Question: Find segment rectangle\'s missing angle (50 + 100 + 120 + x = 360).',
        'result': [new Value(150)],
        getQuestion() {
            let dots = [
                new Dot(140, 42, 'A'),  //0
                new Dot(88, 380, 'B'),  //1
                new Dot(330, 41, 'C'),  //2
                new Dot(355, 385, 'D'), //3
                new Dot(395, 127, 'E'), //4
                new Dot(40, 122, 'F'), //5
                new Dot(127.50270270270269, 123.23243243243246, 'G'), //6
                new Dot(336.189802860773, 126.17168736423628, 'H'), //7
                new Dot(410, 277, 'I'), //8
                new Dot(44, 279, 'J'), //9
                new Dot(103.58855700462769, 278.67437946992004, 'K'),
                new Dot(347.17611191387334, 277.343299934897, 'L')
            ];

            let seg1 = new Line(dots[0], dots[6]);
            let seg2 = new Line(dots[6], dots[10]);
            let seg3 = new Line(dots[10], dots[1]);
            let seg4 = new Line(dots[2], dots[7]);
            let seg5 = new Line(dots[7], dots[11]);
            let seg6 = new Line(dots[11], dots[3]);
            let seg7 = new Line(dots[6], dots[5]);
            let seg8 = new Line(dots[6], dots[7]);
            let seg9 = new Line(dots[4], dots[7]);
            let seg10 = new Line(dots[10], dots[9]);
            let seg11 = new Line(dots[11], dots[10]);
            let seg12 = new Line(dots[8], dots[11]);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2).addSegment(seg3),
                new Line(dots[2], dots[3]).addSegment(seg4).addSegment(seg5).addSegment(seg6),
                new Line(dots[4], dots[5]).addSegment(seg7).addSegment(seg8).addSegment(seg9),
                new Line(dots[8], dots[9]).addSegment(seg10).addSegment(seg11).addSegment(seg12)
            ];

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);
            seg3.setBase(lines[0]);
            seg4.setBase(lines[1]);
            seg5.setBase(lines[1]);
            seg6.setBase(lines[1]);
            seg7.setBase(lines[2]);
            seg8.setBase(lines[2]);
            seg9.setBase(lines[2]);
            seg10.setBase(lines[3]);
            seg11.setBase(lines[3]);
            seg12.setBase(lines[3]);

            let angles = [
                new Angle(dots[6], seg8, seg2).setValue(60),
                new Angle(dots[6], seg2, seg7),
                new Angle(dots[6], seg7, seg1),
                new Angle(dots[6], seg1, seg8),
                new Angle(dots[7], seg4, seg9),
                new Angle(dots[7], seg9, seg5),
                new Angle(dots[7], seg5, seg8).setValue(80),
                new Angle(dots[7], seg8, seg4),
                new Angle(dots[11], seg5, seg12),
                new Angle(dots[11], seg12, seg6),
                new Angle(dots[11], seg6, seg11),
                new Angle(dots[11], seg11, seg5).setValue(70),
                new Angle(dots[10], seg2, seg11).setValue('?'),
                new Angle(dots[10], seg11, seg3),
                new Angle(dots[10], seg3, seg10),
                new Angle(dots[10], seg10, seg2)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[12]
            };
        }
    },

    getSimmilarityQuestion: {
        'name': 'SAS similarity',
        'explanation': 'Question: Similar Triangle. Find missing angle.',
        'result': [new Value(80)],
        getQuestion() {
            let dots = [
                new Dot(114, 73),
                new Dot(11, 214),
                new Dot(219, 232),

                new Dot(324, 63),
                new Dot(221, 204),
                new Dot(429, 222)
            ];

            let lines = [
                new Line(dots[0], dots[1], 6),
                new Line(dots[1], dots[2]),
                new Line(dots[2], dots[0], 8),

                new Line(dots[3], dots[4], 6),
                new Line(dots[4], dots[5]),
                new Line(dots[5], dots[3], 8)
            ];

            let angles = [
                new Angle(dots[0], lines[2], lines[0]).setValue(70),
                new Angle(dots[0], lines[0], lines[2]),
                new Angle(dots[1], lines[0], lines[1]),
                new Angle(dots[1], lines[1], lines[0]),
                new Angle(dots[2], lines[1], lines[2]).setValue(80),
                new Angle(dots[2], lines[2], lines[1]),
                new Angle(dots[3], lines[5], lines[3]).setValue(70),
                new Angle(dots[3], lines[3], lines[5]),
                new Angle(dots[4], lines[3], lines[4]),
                new Angle(dots[4], lines[4], lines[3]),
                new Angle(dots[5], lines[4], lines[5]).setValue('?'),
                new Angle(dots[5], lines[5], lines[4])
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: angles[10]
            };
        }
    },

    getSimmilarityQuestion2: {
        'name': 'SAS similarity 2',
        'explanation': 'Question: Similar Triangle (2). Find line segment\'s length.',
        'result': [new Value(1)],
        getQuestion() {
            let dots = [
                new Dot(234, 65, 'A'),
                new Dot(60, 287, 'B'),
                new Dot(393, 291, 'C'),
                new Dot(334.13419858201996, 207.32911244991516, 'E'),
                new Dot(147.50887891147832, 175.35074069914836, 'F')
            ];

            let seg1 = new Line(dots[0], dots[4]).setValue(6);
            let seg2 = new Line(dots[4], dots[1]).setValue(6);
            let seg3 = new Line(dots[2], dots[3]).setValue('?');
            let seg4 = new Line(dots[3], dots[0]).setValue(8);

            let lines = [
                new Line(dots[0], dots[1]).addSegment(seg1).addSegment(seg2),
                new Line(dots[2], dots[0]).addSegment(seg3).addSegment(seg4),
                new Line(dots[2], dots[1]),
                new Line(dots[3], dots[4])
            ];

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);
            seg3.setBase(lines[1]);
            seg4.setBase(lines[1]);

            dots[3].setBaseLine(lines[2]).setLineRatio(0.37022516615081785);
            dots[4].setBaseLine(lines[1]).setLineRatio(0.4970754085547223);

            let angles = [
                new Angle(dots[0], seg1, seg4),
                new Angle(dots[0], seg4, seg1),
                new Angle(dots[1], seg2, lines[2]),
                new Angle(dots[1], lines[2], seg2),
                new Angle(dots[2], seg3, lines[2]),
                new Angle(dots[2], lines[2], seg3),
                new Angle(dots[4], lines[3], seg2),
                new Angle(dots[4], seg2, seg1).setValue(180),
                new Angle(dots[4], seg1, lines[3]),
                new Angle(dots[3], seg3, lines[3]),
                new Angle(dots[3], lines[3], seg4),
                new Angle(dots[3], seg4, seg3).setValue(180)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [
                    new Equivalence([new AngleSum([angles[2]]), new AngleSum([angles[10]])])
                ],
                question: seg3
            };
        }
    },

    getSimmilarityQuestion3: {
        'name': 'SAS similarity 3',
        'explanation': 'Question: Similar Triangle (3). Find line segment\'s length.',
        'result': [new Value(10)],
        getQuestion() {
            let dots = [
                new Dot(35, 117, 'A'),
                new Dot(36, 284, 'B'),
                new Dot(384, 284, 'C'),
                new Dot(384, 114, 'D'),
                new Dot(206, 284, 'E')
            ];

            let seg1 = new Line(dots[2], dots[4]).setValue(4); // CE
            let seg2 = new Line(dots[4], dots[1]).setValue(5); // EB

            let lines = [
                new Line(dots[0], dots[1]).setValue(2), // AB
                new Line(dots[2], dots[1]).addSegment(seg1).addSegment(seg2), // CB
                new Line(dots[3], dots[2]).setValue('?'), // DC
                new Line(dots[4], dots[0]), // EA
                new Line(dots[3], dots[4]) // DE
            ];

            seg1.setBase(lines[1]);
            seg2.setBase(lines[1]);

            dots[4].setBaseLine(lines[2]).setLineRatio(null);

            let angles = [
                new Angle(dots[1], lines[0], seg2).setValue(90),
                new Angle(dots[1], seg2, lines[0]),
                new Angle(dots[2], seg1, lines[2]).setValue(90),
                new Angle(dots[2], lines[2], seg1),
                new Angle(dots[0], lines[3], lines[0]),
                new Angle(dots[0], lines[0], lines[3]),
                new Angle(dots[4], seg1, seg2).setValue(180),
                new Angle(dots[4], seg2, lines[3]),
                new Angle(dots[4], lines[3], lines[4]).setValue(90),
                new Angle(dots[4], lines[4], seg1),
                new Angle(dots[3], lines[2], lines[4]),
                new Angle(dots[3], lines[4], lines[2]),
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [],
                question: lines[2]
            };
        }
    },

    getMedianTheoremQuestion: {
        'name': 'Apollonius\' Theorem',
        'explanation': 'Question: Apollonius\' Theorem. Find median length.',
        'result': [new Value(14, 1, 2)],
        getQuestion() {
            let dots = [
                new Dot(252, 101, 'A'),
                new Dot(83, 259, 'B'),
                new Dot(383, 291, 'C'),
                new Dot(238.04848338462182, 275.5385048943597, 'E')
            ];

            let seg1 = new Line(dots[2], dots[3]); // CE
            let seg2 = new Line(dots[3], dots[1]); // EB

            let lines = [
                new Line(dots[0], dots[1]).setValue(6), // AB
                new Line(dots[2], dots[0]).setValue(8), // CA
                new Line(dots[2], dots[1]).setValue(12).addSegment(seg1).addSegment(seg2),// CB
                new Line(dots[3], dots[0]).setValue('?') // EA
            ];

            seg1.setBase(lines[2]);
            seg2.setBase(lines[2]);

            dots[3].setBaseLine(lines[2]).setLineRatio(0.6);

            let angles = [
                new Angle(dots[1], seg2, lines[0]),
                new Angle(dots[1], lines[0], seg2),
                new Angle(dots[2], lines[1], seg1),
                new Angle(dots[2], seg1, lines[1]),
                new Angle(dots[0], lines[1], lines[3]),
                new Angle(dots[0], lines[3], lines[0]),
                new Angle(dots[0], lines[0], lines[1]),
                new Angle(dots[3], seg1, seg2).setValue(180),
                new Angle(dots[3], seg2, lines[3]),
                new Angle(dots[3], lines[3], seg1),
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                equivalents: [new Equivalence([seg1, seg2])],
                question: lines[3]
            };
        }
    }
}

export default TestData;