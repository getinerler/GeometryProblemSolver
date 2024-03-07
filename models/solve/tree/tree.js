'use strict';

function Tree() {
    this._root = null;
    this._elements = [];
}

Tree.prototype = {

    getAll() {
        return this._elements;
    },

    insertNode(node) {
        this._elements.push(node);
    },

    getRoot() {
        return this._root;
    },

    setRoot(root) {
        this._root = root;
        return this;
    },

    find(key) {
        let el = this._elements.find((x) => x.getKey() === key);
        return el;
    },

    getKeyList() {
        return this._elements.map((x) => x.getKey());
    }
}

export default Tree;