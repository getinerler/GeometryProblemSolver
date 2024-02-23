'use strict';

import TreeNode from './treeNode.js';

function Tree(key, value) {
    this._root = new TreeNode(key, value);
    this._elements = [this.root];
}

Tree.prototype = {

    insert(key, value, parent) {
        if (!parent) {
            throw 'Tree.insert: No parent.';
        }
        let el = this._elements.find((x) => x === parent);
        if (!el) {
            throw 'Tree.insert: Parent couldn\'t be found.';
        }
        let node = new TreeNode(key, value, el);
        el.insert(node);
    },

    find(key) {
        let el = this._elements.find((x) => x.getKey() === key);
        return el;
    }

}

export default Tree;