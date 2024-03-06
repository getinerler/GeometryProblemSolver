'use strict';

const Creations = {

    Subtraction: {
        'show': true,
        getExplanation() {
            return 'Subtraction.'
        }
    },

    TermMultiplied: {
        'show': true,
        getExplanation() {
            return 'Term multiplied'
        }
    },

    ValueExponentsSimplified: {
        'show': true,
        getExplanation() {
            return 'Value exponents simplified.'
        }
    },

    LeftAndRightElementsFixed: {
        'show': true,
        getExplanation() {
            return 'Left and right elements fixed.'
        }
    },

    LeftValuesSimplified: {
        'show': true,
        getExplanation() {
            return 'Left values simplified.'
        }
    },

    VariableSimplified: {
        'show': true,
        getExplanation() {
            return 'Variable simplified.'
        }
    },

    CoefficientsSimplified: {
        'show': true,
        getExplanation() {
            return 'Coefficients simplified.'
        }
    },

    ExponentiatonRemoved: {
        'show': true,
        getExplanation() {
            return 'Exponentiaton removed.'
        }
    },

    CoefficientRemoved: {
        'show': true,
        getExplanation() {
            return 'Coefficient removed.'
        }
    },

    KnownValuesSimplified: {
        'show': true,
        getExplanation() {
            return 'Known values simplified.'
        }
    },

    SegmentSum: {
        'show': true,
        getExplanation() {
            return 'Segment\'s length sum equal to line length.'
        }
    },

    Supplementary180: {
        'show': true,
        getExplanation() {
            return 'Supplementary angles equal to 180.'
        }
    },

    SupplementaryAngles: {
        'show': true,
        getExplanation() {
            return 'Supplementary angles.'
        }
    },

    Round360: {
        'show': true,
        getExplanation() {
            return 'Round angle equals to 360.'
        }
    },

    ReverseAngles: {
        'show': true,
        getExplanation() {
            return 'Reverse angles.'
        }
    },

    CorrespondingAngles: {
        'show': true,
        getExplanation() {
            return 'Corresponding angles.'
        }
    },

    Triangle180: {
        'show': true,
        getExplanation() {
            return 'Triangle angles equal to 180.'
        }
    },

    IsoscelesLines: {
        'show': true,
        getExplanation() {
            return 'Isosceles triangle lines.'
        }
    },

    IsoscelesAngles: {
        'show': true,
        getExplanation() {
            return 'Isosceles triangle angles.'
        }
    },

    PythagorianTheorem: {
        'name': 'Pythagorian Theorem.',
        'show': true,
        getExplanation() {
            return 'Pythagorian Theorem.'
        }
    },

    GeometricMeanTheorem: {
        'show': true,
        getExplanation() {
            return 'Geometric Mean Theorem.'
        }
    },

    SimilarAngles: {
        'show': true,
        getExplanation(sim) {
            return 'Similar triangle (' + sim.toString() + ') angles.'
        }
    },

    SimilarLines: {
        'show': true,
        getExplanation(sim) {
            return 'Similar triangle (' + sim.toString() + ') lines.'
        }
    },

    Rectangle360: {
        'show': true,
        getExplanation() {
            return 'Rectangle angles equal to 360.'
        }
    }

}

export default Creations;