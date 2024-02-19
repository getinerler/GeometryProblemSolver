'use strict';

//Thanks to https://javascript.plainenglish.io/unit-test-front-end-javascript-code-without-a-framework-8f00c63eb7d4

const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

export function it(desc, fn) {
    try {
        fn();
        if (isFirefox) {
            console.log('%c \u2714 ' + desc, 'color:green ');
        } else {
            console.log('\x1b[32m%s\x1b[0m', '\u2714 ' + desc);
        }
    } catch (error) {
        if (isFirefox) {
            console.log('%c \u2718 ' + desc, 'color:red ');
        } else {
            console.log('\x1b[31m%s\x1b[0m', '\u2718 ' + desc);
        }
        console.error(error);
    }
}

export function assert(isTrue) {
    if (!isTrue) {
        throw new Error();
    }
}