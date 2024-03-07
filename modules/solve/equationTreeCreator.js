'use strict';

import TreeNode from '../../models/solve/tree/treeNode.js';
import Tree from '../../models/solve/tree/tree.js';

function EquationTreeCreator(equations) {
    this._equations = equations;
}

EquationTreeCreator.prototype = {

    createTree() {
        let ids = this.getEliminatedEquations();
        let equations = this._equations.filter((x) => ids.indexOf(x.getCount()) > -1);

        let nodes = [];
        for (let eq of equations) {
            let node = new TreeNode(eq.getCount(), eq);
            nodes.push(node);
        }

        let root = null;

        for (let node of nodes) {
            if (node.getValue().isAnswer()) {
                root = node;
            }
            let ancestorIds = node.getValue().getAncestorIds();
            let ancestorNodes = nodes
                .filter((x) => ancestorIds.indexOf(x.getValue().getCount()) > -1);
            for (let ancestorNode of ancestorNodes) {
                ancestorNode.setParent(node);
                node.addChild(ancestorNode);
            }
        }

        let tree = new Tree();
        for (let node of nodes) {
            tree.insertNode(node);
        }
        tree.setRoot(root);

        return tree;
    },

    getEliminatedEquations() {
        let ids = [];
        let equationTemp = [];
        let answer = this._equations.find((x) => x.isAnswer());
        equationTemp.push(answer);

        while (equationTemp.length > 0) {
            let el = equationTemp.pop();
            ids.push(el.getCount());
            for (let anc of el.getAncestors()) {
                equationTemp.push(anc);
            }
        }

        return ids;
    }

}

export default EquationTreeCreator;