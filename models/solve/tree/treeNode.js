'use strict';

function TreeNode(key, value, parent) {
    this._key = key;
    this._value = value;
    this._parent = parent || null;
    this._children = [];
}

TreeNode.prototype = {

    getKey() {
        return this._key;
    },
    
    getValue() {
        return this._value;
    },

    isRoot() {
        return this._parent.length === null;
    },

    isLeaf() {
        return this.children.length === 0;
    },

    hasChildren() {
        return !this.isLeaf;
    }
}

export default TreeNode;