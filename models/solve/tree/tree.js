'use strict';

import TreeNode from './treeNode.js';

function Tree() {
    this._root = null;
    this._elements = [];
}

Tree.prototype = {

    insertNode(node) {
        this.insert(node.getKey(), node.getValue(), node.getParent());
    },

    insert(key, value, parent) {
        if (!parent) {
            let node = new TreeNode(key, value);
            this._root = node;
            this._elements.push(node);
            return;
        }
        let el = this._elements.find((x) => x === parent);
        if (!el) {
            throw 'Tree.insert: Parent couldn\'t be found.';
        }
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