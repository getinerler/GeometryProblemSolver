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
            if (eq.isAnswer()) {
                nodes.push(new TreeNode(eq.getCount(), eq));
            } else {
                let node = new TreeNode(eq.getCount(), eq);
                let parentNode = nodes.find((x) => x.getKey() === eq.getCount());
                if (parentNode) {
                    node.setParent(parentNode);
                    parentNode.addChild(node);
                }
                nodes.push(node);
            }
        }

        let tree = new Tree();
        for (let node of nodes) {
            tree.insertNode(node);
        }
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