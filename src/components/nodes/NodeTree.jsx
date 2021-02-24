import React, { useState, useContext } from 'react'
import { Node } from '../Root.jsx'
import { TestDataContext } from "../../index";

function NodeTree(props) {
    const { getSelectedNode, filter } = props;
    const testData = useContext(TestDataContext);

    const [nodes, setNodes] = useState(testData);

    const getChildNodes = (node) => {
        return node.children.map((node) => nodes[node.index]);
    };

    const hasChildren = (node) => {
        return node.children.length !== 0;
    };

    const onToggle = (node) => {
        const newNodes = nodes.map((n) => {
            if (n.index === node.index) {
                return { ...n, isOpen: !node.isOpen };
            }
            return n;
        });
        setNodes(newNodes);
    };
    const firstLevelNode = nodes[0];

    return (
        <div>
            <Node
                key={firstLevelNode.index}
                node={firstLevelNode}
                getChildNodes={getChildNodes}
                onToggle={onToggle}
                hasChildren={hasChildren}
                getSelectedNode={getSelectedNode}
                filter={filter}
            />
        </div>
    );
}

export default NodeTree