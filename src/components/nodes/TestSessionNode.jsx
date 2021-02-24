import React from 'react'
import {IconFail, IconSuccess, StatusFail, StatusSuccess} from '../Root.jsx'

function TestSessionNode({ node }) {
    return (
        <>
            {!node.summary.success ? <IconFail /> : <IconSuccess />}
            <span>{node.type}</span>
            {!node.summary.success ? (
                <StatusFail status={"FAILED"} />
            ) : (
                    <StatusSuccess status={"SUCCESS"} />
                )}
        </>
    );
}

export default TestSessionNode