'use strict';

import { resetNames } from '../../modules/graphic/names.js';
import Solve from '../../modules/solve/solve.js';
import TestData from '../testData.js';
import { it, assert } from '../test.js';

document.addEventListener('DOMContentLoaded', function () {
    console.log('Check test data...');
    for (let question in TestData) {
        let test = TestData[question];
        it(test.explanation, function () {
            let solve = new Solve(test.getQuestion()).solve();
            resetNames();
            assert(solve.solved);
            for (let i = 0; i < test.result.length; i++) {
                assert(solve.value[i].equals(test.result[i]));
            }
        });
    }
});