import React from 'react'

function TestPlanNode({ node }) {
    return (
        <>
            <span>
                Ready to run <strong>{node.tests.length}</strong> test(s).
        </span>
        </>
    );
}

export default TestPlanNode