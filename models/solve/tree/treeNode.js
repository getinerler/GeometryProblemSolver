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
        return this._parent === null;
    },

    isLeaf() {
        return this.children.length === 0;
    },

    addChild(node) {
        this._children.push(node);
    },

    hasChildren() {
        return !this.isLeaf;
    },

    getParent() {
        return this._parent;
    },

    setParent(parent) {
        this._parent = parent;
    }
}

export default TreeNode;