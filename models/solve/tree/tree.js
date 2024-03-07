'use strict';

import TreeNode from './treeNode.js';

function Tree() {
    this._root = null;
    this._elements = [];
}

Tree.prototype = {

    getAll() {
        return this._elements;
    },

    insertNode(node) {
        this.insert(node.getKey(), node.getValue(), node.getParent());
    },

    getRoot() {
        return this._root;
    },

    insert(key, value, parent) {
            if (!parent) {
                let node = new TreeNode(key, value);
                this._root = node;
                this._elements.push(node);
                return;
            }
            let el = this._elements.find((x) => x === parent);
            let node = new TreeNode(key, value, el);
            this._elements.push(node);
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