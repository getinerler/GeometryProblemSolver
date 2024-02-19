'use strict';

let counter = 0;

let names = [
    "A", "B", "C", "D", "E", "F", "G", "H",
    "I", "J", "K", "L", "M", "N", "O", "P",
    "R", "S", "T", "U", "V", "Y", "Z"
];

export function getDotName() {
    let length = names.length;
    let num = Math.floor(counter / length);
    let name = names[counter % length] + (num === 0 ? "" : num.toString());
    counter++;
    return name;
}

export function resetNames() {
    counter = 0;
}