'use strict';

import Dot from '../models/graphic/dot.js';
import Line from '../models/graphic/line.js';
import Angle from '../models/graphic/angle.js';
import Parallel from '../models/graphic/parallel.js';
import Value from '../models/equations/value.js';

const TestData = {

    getLineSegmentSumQuestion: {
        'name': 'Find segment',
        'explanation': 'Question: Find line segment\'s length.',
        'result': [new Value(6)],
        getQuestion() {
            let dots = [
                new Dot(345, 253, 'A'),
                new Dot(60, 69, 'B'),
                new Dot(202.5997146785354, 161.06437719596673, 'C'),
            ];

            let seg1 = new Line(dots[0], dots[2]); // AD
            let seg2 = new Line(dots[2], dots[1]); // DB

            let lines = [
                new Line(dots[0], dots[1]) // AB
                    .addSegment(seg1)
                    .addSegment(seg2)
                    .setValue(10)
            ];

            seg1.setValue(4).setBase(lines[0]);
            seg2.setValue('?').setBase(lines[0]);

            let angles = [];

            return {
                dots,
                lines,
                angles,
                parallels: [],
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
                new Dot(207.99508515987353, 197.45789799214836, 'D'),
            ];
            let seg1 = new Line(dots[0], dots[3]); // AD
            let seg2 = new Line(dots[3], dots[1]); // DB
            let lines = [
                new Line(dots[0], dots[1]) // AB
                    .addSegment(seg1)
                    .addSegment(seg2)
                ,
                new Line(dots[2], dots[3]) // CD
                ,
            ];
            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);

            dots[3].setBaseLine(lines[1]).setLineRatio(0.5140340026172164);
            let angles = [
                new Angle(dots[3], seg1, seg2),
                new Angle(dots[3], seg2, lines[1]).setValue(120),
                new Angle(dots[3], lines[1], seg1).setValue('?'),
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                question: angles[2]
            }
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

            let seg1 = new Line(dots[0], dots[4]); // AE
            let seg2 = new Line(dots[4], dots[1]); // EB
            let seg3 = new Line(dots[2], dots[4]); // CE
            let seg4 = new Line(dots[4], dots[3]); // ED

            let lines = [
                new Line(dots[0], dots[1]) // AB
                    .addSegment(seg1)
                    .addSegment(seg2),
                new Line(dots[2], dots[3]) // CD
                    .addSegment(seg3)
                    .addSegment(seg4)
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
                question: angles[3]
            }
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
                new Angle(dots[4], imgLines[3], imgLines[0]).setValue(60),
                new Angle(dots[4], imgLines[0], imgLines[2]).setValue('?'),
                new Angle(dots[4], imgLines[2], imgLines[1]).setValue(60)
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                question: angles[2]
            }
        }
    },

    getCorrespAngleQuestion: {
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
                question: angles[3]
            }
        },
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
                question: angles[2]
            }
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
                //AC-AB(70), AB-AC
                new Angle(dots[0], lines[2], lines[0]).setValue(70),
                new Angle(dots[0], lines[0], lines[2]),
                //BC-AB(80), AB-BC
                new Angle(dots[1], lines[0], lines[1]).setValue(80),
                new Angle(dots[1], lines[1], lines[0]),
                //BC-AC(?), AC-BC
                new Angle(dots[2], lines[1], lines[2]).setValue('?'),
                new Angle(dots[2], lines[2], lines[1])
            ];
            return {
                dots,
                lines,
                angles,
                parallels: [],
                question: angles[4]
            }
        }
    },

    getTriangleAngleQuestion2: {
        'name': 'Triangle angle 2',
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
                new Dot(323.5563719680809, 184.29398751678912, 'G'),
            ];

            let seg1 = new Line(dots[0], dots[5]); // AF
            let seg2 = new Line(dots[5], dots[1]); // FB
            let seg3 = new Line(dots[2], dots[6]); // CG
            let seg4 = new Line(dots[6], dots[0]); // GA
            let seg5 = new Line(dots[5], dots[4]); // FE
            let seg6 = new Line(dots[3], dots[6]); // DG
            let seg7 = new Line(dots[6], dots[5]); // GF

            let lines = [
                new Line(dots[0], dots[1]) // AB
                    .addSegment(seg1)
                    .addSegment(seg2),
                new Line(dots[2], dots[0]) // CA
                    .addSegment(seg3)
                    .addSegment(seg4),
                new Line(dots[3], dots[4]) // DE
                    .addSegment(seg5)
                    .addSegment(seg6)
                    .addSegment(seg7)
            ]

            seg1.setBase(lines[0]);
            seg2.setBase(lines[0]);
            seg3.setBase(lines[1]);
            seg4.setBase(lines[1]);
            seg5.setBase(lines[2]);
            seg6.setBase(lines[2]);
            seg7.setBase(lines[2]);

            //  dots[6].setBaseLine(lines[3]).setLineRatio(null);

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
                new Angle(dots[6], seg4, seg6),
            ];

            return {
                dots,
                lines,
                angles,
                parallels: [],
                question: angles[1]
            }
        }
    },

    getTriangleAngleQuestion3: {
        'name': 'Triangle angle 3',
        'explanation': 'Question: Find segment triangle\'s missing angle (70 + 80 + x = 180).',
        'result': [new Value(60)],
        getQuestion() {
            let dots = [
                new Dot(238, 41, 'A'),
                new Dot(51, 241, 'B'),
                new Dot(373, 255, 'C'),
                new Dot(302.6668704409358, 143.50896499526118, 'E'),
                new Dot(211.84199128313574, 247.9931300557885, 'F'),
            ];
            let seg1 = new Line(dots[2], dots[3]); // CE
            let seg2 = new Line(dots[3], dots[0]); // EA
            let seg3 = new Line(dots[2], dots[4]); // CF
            let seg4 = new Line(dots[4], dots[1]); // FB

            let lines = [
                new Line(dots[0], dots[1]), // AB
                new Line(dots[2], dots[0]) // CA
                    .addSegment(seg1)
                    .addSegment(seg2),

                new Line(dots[2], dots[1]) // CB
                    .addSegment(seg3)
                    .addSegment(seg4),
                new Line(dots[3], dots[4]) // EF
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
                new Angle(dots[3], seg2, seg1),
            ];
            return {
                dots,
                lines,
                angles,
                parallels: [],
                question: angles[2]
            }
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
                new Line(dots[0], dots[1]).setValue(10), // AB
                new Line(dots[2], dots[0]).setValue('?'), // CA
                new Line(dots[2], dots[1]) // CB
            ];
            let angles = [
                new Angle(dots[0], lines[0], lines[1]),
                new Angle(dots[0], lines[1], lines[0]),
                new Angle(dots[1], lines[0], lines[2]).setValue(50),
                new Angle(dots[1], lines[2], lines[0]),
                new Angle(dots[2], lines[1], lines[2]),
                new Angle(dots[2], lines[2], lines[1]).setValue(50)
            ];
            return {
                dots,
                lines,
                angles,
                parallels: [],
                question: lines[1]
            }
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
                new Line(dots[0], dots[1]).setValue(10), // AB
                new Line(dots[2], dots[0]).setValue(10), // CA
                new Line(dots[2], dots[1]) // CB
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
                question: angles[5]
            }
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
                question: lines[2]
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
                question: angles[7]
            }
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
                new Dot(103.58855700462769, 278.67437946992004, 'K'), //10
                new Dot(347.17611191387334, 277.343299934897, 'L'), //11
            ];

            let seg1 = new Line(dots[0], dots[6]); // AG
            let seg2 = new Line(dots[6], dots[10]); // GK
            let seg3 = new Line(dots[10], dots[1]); // KB

            let seg4 = new Line(dots[2], dots[7]); // CH
            let seg5 = new Line(dots[7], dots[11]); // HL
            let seg6 = new Line(dots[11], dots[3]); // LD

            let seg7 = new Line(dots[6], dots[5]); // GF
            let seg8 = new Line(dots[6], dots[7]); // GH
            let seg9 = new Line(dots[4], dots[7]); // HE

            let seg10 = new Line(dots[10], dots[9]); // KJ
            let seg11 = new Line(dots[11], dots[10]); // KL
            let seg12 = new Line(dots[8], dots[11]); // IL

            let lines = [
                new Line(dots[0], dots[1]) // AB
                    .addSegment(seg1)
                    .addSegment(seg2)
                    .addSegment(seg3),
                new Line(dots[2], dots[3]) // CD
                    .addSegment(seg4)
                    .addSegment(seg5)
                    .addSegment(seg6),
                new Line(dots[4], dots[5]) // EF
                    .addSegment(seg7)
                    .addSegment(seg8)
                    .addSegment(seg9),
                new Line(dots[8], dots[9]) // IJ
                    .addSegment(seg10)
                    .addSegment(seg11)
                    .addSegment(seg12)
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
                question: angles[12]
            }
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
                question: angles[10]
            }
        }
    }
}

export default TestData;