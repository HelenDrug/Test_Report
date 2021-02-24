/* eslint-disable react/jsx-key */
/* eslint-disable no-prototype-builtins */
import React, { useState, useEffect , useContext} from 'react'
import TestSessionNode from './nodes/TestSessionNode.jsx'
import TestPlanNode from './nodes/TestPlanNode.jsx'
import NodeTree from './nodes/NodeTree.jsx'
import { TestDataContext } from "../index";
const truncateString = (str, number) => {
    if (str.length <= 60) {
        return str;
    }
    return `${str.slice(0, number)} ... ${str.slice(-number, str.length)}`;
};

// https://github.com/airbnb/javascript#functions
// applies to all functions
const Root = () => {
    const testData = useContext(TestDataContext);
    // can be simplified by moving the name into hook itself and the value is the node
    // and name could be less verbose
    // const [selectedNode, setSelectedNode] = useState({})
    const [state, setState] = useState({
        selectedNodeToDisplay: {},
    });
    const [checkBoxes, setCheckBoxes] = useState([]);

    const prefix = testData[0].utrPrefix;

    // name implies we get the node while in reality it is setting the  node
    // in future this could be renamed to setSelectedNode
    // can be removed as it is not needed due to earlier suggested refactor
    // setSelectedNode would be equal to this function
    const getSelectedNode = (childNode) => {
        setState({ selectedNodeToDisplay: childNode });
    };

    // this method is redundant and setCheckBoxes can be passed directly
    const handleCheckBoxes = (boxes) => {
        setCheckBoxes(boxes);
    };

    return (
        <div className="App">
            <header
                className={`test-report-header ${!status ? `bgFail` : `bgSuccess`
                    }`}
            >
                <h1>Test Session Report</h1>
            </header>
            <TestFilter getCheckBoxes={handleCheckBoxes} />
            <SplitPane>
                <SplitPane.Left>
                    <div className="content-header">
                        <span>Action</span>
                        <span>Duration</span>
                        <span>Artifacts</span>
                    </div>
                    <div>
                        <NodeTree
                            getSelectedNode={getSelectedNode}
                            filter={checkBoxes}
                        />
                    </div>
                </SplitPane.Left>
                <SplitPane.Right>
                    <DisplayTree
                        selectedNodeToDisplay={state.selectedNodeToDisplay}
                        prefix={prefix}
                    />
                </SplitPane.Right>
            </SplitPane>
        </div>
    );
};

const TestFilter = (props) => {
    // would recommend splitting into three different useState variables
    // const [ ignored, setIgnored ] = useState(false)
    // etc...
    const [checkBoxes, setCheckBoxes] = useState([
        { value: "ignored", isChecked: false },
        { value: "passed", isChecked: false },
        { value: "failed", isChecked: true },
    ]);

    const handleClick = (event) => {
        let boxes = [...checkBoxes];
        boxes.forEach((box) => {
            if (box.value === event.target.value) {
                box.isChecked = event.target.checked;
            }
        });
        setCheckBoxes(boxes);
    };

    const getCheckBoxValue = () => {
        return props.getCheckBoxes(checkBoxes);
    };

    useEffect(() => {
        return getCheckBoxValue(checkBoxes);
    });

    return (
        <div className="navigation">
            <form className="test-filter">
                <fieldset>
                    <legend>Test Status filter</legend>
                    <span className="filter-item">
                        <label className="checkbox">
                            Ignored
                <input
                                type="checkbox"
                                name="ignored"
                                /* 
                                refactor to state could then simplify these 4 methods 
                                both onChange and onClick looks a little odd on an input
                                may be possible refactor 
                                */
                                value={checkBoxes[0].value}
                                checked={checkBoxes[0].isChecked}
                                onChange={handleClick}
                                onClick={getCheckBoxValue}
                            />
                        </label>
                    </span>
                    <span className="filter-item">
                        <label className="checkbox">
                            Passed
                <input
                                type="checkbox"
                                name="passed"
                                value={checkBoxes[1].value}
                                checked={checkBoxes[1].isChecked}
                                onChange={handleClick}
                                onClick={getCheckBoxValue}
                            />
                        </label>
                    </span>
                    <span className="filter-item">
                        <label className="checkbox">
                            Failed
                <input
                                type="checkbox"
                                name="failed"
                                value={checkBoxes[2].value}
                                checked={checkBoxes[2].isChecked}
                                onChange={handleClick}
                                onClick={getCheckBoxValue}
                            />
                        </label>
                    </span>
                </fieldset>
            </form>
        </div>
    );
};


export const Node = (props) => {
    const {
        node,
        getChildNodes,
        onToggle,
        hasChildren,
        getSelectedNode,
        filter,
    } = props;

    const getCarretStyle = (node) => {
        if (!hasChildren(node)) {
            // is this return to display nothing?
            // slightly confused, if it is nothing could use React.Fragment
            return (
                <span>
                    {" "}
                    <span></span>
                </span>
            );
        }

        return <i className={`fas fa-${node.isOpen ? "minus" : "plus"}`} />
    };

    // unnecessary method wrap
    const getNode = (node) => {
        return getSelectedNode(node);
    };

    const showArtifacts = () => {
        // conditional if, while javascript makes it work
        // it is generally discouraged and most linters will be unhappy :)
        // add a default return which could return React.Fragment
        if (node.artifacts.length != 0) {
            return (
                <span>
                    {node.artifacts.length}
                    <i className="fas fa-paperclip"></i>
                </span>
            );
        }
    };

    const showNode = () => {
        if (node.type === null) {
            return;
        }
        switch (node.type) {
            case "TestSession":
                return <TestSessionNode node={node} />;
            case "TestPlan":
                return <TestPlanNode node={node} />;
            case "TestSuite":
                return <TestSuiteNode node={node} />;
            case "TestStatus":
                return <TestStatusNode node={node} />;
            case "TestGroup":
                return <TestGroupNode node={node} />;
            case "Assert":
                return <AssertNode node={node} />;
            case "ProcessInfo":
                return <ProcessInfoNode node={node} />;
            case "Info":
                return <InfoNode node={node} />;
            case "LogEntry":
                return <LogEntryNode node={node} />;
            case "MemoryLeaks":
                return <MemoryLeaksNode node={node} />;
            default:
                //return <DefaultNode node={node} />;
                // in case we should never end up under other nodes
                // logging an error/warning on the severity or displaying
                // it to user could save future issues
                return null;
        }
    };

    const durationToTimeStr = (time) => {
        if (node.hasOwnProperty("duration")) {
            const date = new Date(time);
            const pad = (v, n = 2) => v.toString().padStart(n, "0");
            return `${pad(date.getUTCHours())}:${pad(
                date.getUTCMinutes()
            )}:${pad(date.getUTCSeconds())}:${pad(date.getUTCMilliseconds())}`;
        }
    };

    const shouldDisplayFailed = (filter) => {
        // https://github.com/airbnb/javascript#variables--unary-increment-decrement
        for (let i = 0; i < filter.length; ++i) {
            if (filter[i].value === "failed" && filter[i].isChecked === true) {
                return true;
            }
        }
        return false;
    };

    const shouldDisplayPassed = (filter) => {
        for (let i = 0; i < filter.length; ++i) {
            if (filter[i].value === "passed" && filter[i].isChecked === true) {
                return true;
            }
        }
        return false;
    };

    const shouldDisplayIgnored = (filter) => {
        for (let i = 0; i < filter.length; ++i) {
            if (filter[i].value === "ignored" && filter[i].isChecked === true) {
                return true;
            }
        }
        return false;
    };

    const isFailedTestStatus = (testStatusNode) => {
        return (
            testStatusNode.state === 0 ||
            testStatusNode.state === 5 ||
            testStatusNode.state === 6
        );
    };

    const isPassedTestStatus = (testStatusNode) => {
        return testStatusNode.state === 4;
    };

    const isIgnoredTestStatus = (testStatusNode) => {
        return (
            testStatusNode.state === 1 ||
            testStatusNode.state === 2 ||
            testStatusNode.state === 3 ||
            testStatusNode.state === 7
        );
    };

    const isFailedTestGroup = (testNode) => {
        return testNode.errors.length !== 0 ? true : false;
    };

    const isPassedTestGroup = (testNode) => {
        return testNode.errors.length == 0 ? true : false;
    };

    const isFailedTestSuite = (testNode) => {
        return testNode.errors.length !== 0 ? true : false;
    };

    const isPassedTestSuite = (testNode) => {
        return testNode.errors.length == 0 ? true : false;
    };

    const displayTestStatusNode = (child, filter) => {
        const shouldBeDisplayed =
            (shouldDisplayFailed(filter) && isFailedTestStatus(child)) ||
            (shouldDisplayPassed(filter) && isPassedTestStatus(child)) ||
            (shouldDisplayIgnored(filter) && isIgnoredTestStatus(child));

        if (shouldBeDisplayed) {
            return (
                <Node
                    node={child}
                    key={child.index}
                    getChildNodes={getChildNodes}
                    onToggle={onToggle}
                    hasChildren={hasChildren}
                    getSelectedNode={getNode}
                    filter={filter}
                />
            );
        } else {
            return null;
        }
    };

    const displayTestGroupNode = (child, filter) => {
        const shouldBeDisplayed =
            (shouldDisplayFailed(filter) && isFailedTestGroup(child)) ||
            (shouldDisplayPassed(filter) && isPassedTestGroup(child));

        if (shouldBeDisplayed) {
            return (
                <Node
                    node={child}
                    key={child.index}
                    getChildNodes={getChildNodes}
                    onToggle={onToggle}
                    hasChildren={hasChildren}
                    getSelectedNode={getNode}
                    filter={filter}
                />
            );
        } else {
            return null;
        }
    };

    const displayTestSuiteNode = (child, filter) => {
        const shouldBeDisplayed =
            (shouldDisplayFailed(filter) && isFailedTestSuite(child)) ||
            (shouldDisplayPassed(filter) && isPassedTestSuite(child));

        if (shouldBeDisplayed) {
            return (
                <Node
                    node={child}
                    key={child.index}
                    getChildNodes={getChildNodes}
                    onToggle={onToggle}
                    hasChildren={hasChildren}
                    getSelectedNode={getNode}
                    filter={filter}
                />
            );
        } else {
            return null;
        }
    };

    // const displayInfoNode = (child, filter) => {
    //     for (let i = 0; i < filter.length; ++i) {
    //         if (filter[i].value === "failed" && filter[i].isChecked === true) {
    //             return null;
    //         } else if (
    //             filter[i].value === "passed" &&
    //             filter[i].isChecked === true
    //         ) {
    //             return (
    //                 <Node
    //                     node={child}
    //                     key={child.index}
    //                     getChildNodes={getChildNodes}
    //                     onToggle={onToggle}
    //                     hasChildren={hasChildren}
    //                     getSelectedNode={getNode}
    //                     filter={filter}
    //                 />
    //             );
    //         }
    //     }
    // };

    return (
        <>
            <div className="node-container">
                <div
                    className="node-title"
                    role="button"
                    onClick={() => getNode(node)}
                >
                    <span className="toggle" onClick={() => onToggle(node)}>
                        {getCarretStyle(node)}
                    </span>
                    {showNode()}
                </div>
                <div className="duration">{durationToTimeStr(node.duration)}</div>
                <div className="artifacts">{showArtifacts()}</div>
            </div>

            <div className="node-child">
                {node.isOpen &&
                    getChildNodes(node).map((childNode) => {
                        if (childNode.type === "ArtifactPublish") {
                            return null;
                        }
                        if (childNode.type === "Info") {
                            return null;
                        }
                        if (childNode.type === "TestStatus") {
                            return displayTestStatusNode(childNode, filter);
                        }
                        if (childNode.type === "TestGroup") {
                            return displayTestGroupNode(childNode, filter);
                        }
                        if (childNode.type === "TestSuite") {
                            return displayTestSuiteNode(childNode, filter);
                        } else {
                            return (
                                <Node
                                    node={childNode}
                                    key={childNode.index}
                                    getChildNodes={getChildNodes}
                                    onToggle={onToggle}
                                    hasChildren={hasChildren}
                                    getSelectedNode={getNode}
                                    filter={filter}
                                />
                            );
                        }
                    })}
            </div>
        </>
    );
};

const DisplayTree = ({ selectedNodeToDisplay, prefix }) => {
    const getComponentToDisplay = () => {
        if (selectedNodeToDisplay.type === null) {
            return;
        }

        switch (selectedNodeToDisplay.type) {
            case "ProcessInfo":
                return (
                    <ProcessInfo selectedNodeToDisplay={selectedNodeToDisplay} />
                );
            case "TestSession":
                return (
                    <TestSession
                        selectedNodeToDisplay={selectedNodeToDisplay}
                        prefix={prefix}
                    />
                );
            case "TestSuite":
                return (
                    <TestSuite
                        selectedNodeToDisplay={selectedNodeToDisplay}
                        prefix={prefix}
                    />
                );
            case "TestPlan":
                return <TestPlan selectedNodeToDisplay={selectedNodeToDisplay} />;
            case "TestGroup":
                return (
                    <TestGroup selectedNodeToDisplay={selectedNodeToDisplay} />
                );
            case "TestStatus":
                return (
                    <TestStatus
                        selectedNodeToDisplay={selectedNodeToDisplay}
                        prefix={prefix}
                    />
                );
            case "Info":
                return <Info selectedNodeToDisplay={selectedNodeToDisplay} />;
            case "LogEntry":
                return <LogEntry selectedNodeToDisplay={selectedNodeToDisplay} />;
            case "MemoryLeaks":
                return (
                    <MemoryLeaks selectedNodeToDisplay={selectedNodeToDisplay} />
                );
            default:
        }
    };

    return <div>{getComponentToDisplay()}</div>;
};

//components to display on NodeTree (left part)
const TestSuiteNode = ({ node }) => {
    return (
        <>
            {node.errors.length !== 0 ? <IconFail /> : <IconSuccess />}
            <span>
                Run <strong>{node.name}</strong> tests for{" "}
                <strong>{node.scope}</strong>
            </span>
        </>
    );
};

const TestStatusNode = ({ node }) => {
    const setIcon = () => {
        switch (node.state) {
            case 0:
                return null;
            case 1:
            case 2:
            case 3:
            case 7:
                return <IconIgnored />;
            case 5:
            case 6:
                return <IconFail />;
            case 4:
                return <IconSuccess />;
            default:
                return null;
        }
    };

    // const setStatus = () => {
    //     switch (node.state) {
    //         case 0:
    //             return <StatusInconclusive status={"Inconclusive"} />;
    //         case 1:
    //         case 2:
    //         case 3:
    //         case 7:
    //             return <StatusIgnored status={"Ignored"} />;
    //         case 4:
    //             return <StatusSuccess status={"Success"} />;
    //         case 5:
    //         case 6:
    //             return <StatusFail status={"Failed"} />;
    //         default:
    //             return null;
    //     }
    // };

    return (
        <>
            {setIcon()}
            <span>{node.name}</span>
        </>
    );
};

const TestGroupNode = ({ node }) => {
    const shortenPathName = (path) => {
        const regex = /[/\\]/;
        const tokens = path.split(regex);
        let fileName = tokens[tokens.length - 1];
        return fileName;
    };

    return (
        <>
            {node.errors.length !== 0 ? <IconFail /> : <IconSuccess />}
            <span>{shortenPathName(node.name)}</span>
        </>
    );
};

const AssertNode = ({ node }) => {
    return (
        <>
            <IconFail />
            <span>{node.name}</span>
        </>
    );
};

const ProcessInfoNode = ({ node }) => {
    return (
        <>
            <span>Start process:</span>
            {node.exitCode !== 0 ? (
                <span className="statusFail">
                    {truncateString(node.path, 30)}
                </span>
            ) : (
                    <span>{truncateString(node.path, 30)}</span>
                )}
        </>
    );
};

const InfoNode = ({ node }) => {
    return (
        <>
            <span>{truncateString(node.message, 30)}</span>
        </>
    );
};

const LogEntryNode = ({ node }) => {
    const setSeverity = () => {
        switch (node.severity) {
            case "Error":
                return <IconFail />;
            case "Warning":
                return <IconWarn />;
            case "Assert":
                return <IconFail />;
            default:
                return null;
        }
    };

    return (
        <>
            {setSeverity()}
            <span>{node.message}</span>
        </>
    );
};

const MemoryLeaksNode = () => {
    return (
        <>
            <span>Memory leaks</span>
        </>
    );
};

// const DefaultNode = ({ node }) => {
//     return (
//         <>
//             {node.name != 0 ? (
//                 <span>
//                     {node.type}
//                     {node.name}
//                 </span>
//             ) : (
//                     <span>{node.type}</span>
//                 )}
//         </>
//     );
// };

//small components for NodeTree components composition

export const IconFail = () => {
    return (
        <>
            <span>
                <i className="fas fa-ban iconFail"></i>
            </span>
        </>
    );
};

export const IconSuccess = () => {
    return (
        <>
            <span>
                <i className="fas fa-check iconSuccess"></i>
            </span>
        </>
    );
};

export const IconIgnored = () => {
    return (
        <>
            <span>
                <i className="fas fa-eye-slash iconIgnored"></i>
            </span>
        </>
    );
};

export const IconWarn = () => {
    return (
        <>
            <span>
                <i className="fa fa-exclamation"></i>
            </span>
        </>
    );
};

export const StatusFail = ({ status }) => {
    return (
        <>
            <span className="statusFail">{status}</span>
        </>
    );
};

export const StatusSuccess = ({ status }) => {
    return (
        <>
            <span className="statusSuccess">{status}</span>
        </>
    );
};

export const StatusIgnored = ({ status }) => {
    return (
        <>
            <span className="statusIgnored">{status}</span>
        </>
    );
};

export const StatusInconclusive = ({ status }) => {
    return (
        <>
            <span className="statusInconclusive">{status}</span>
        </>
    );
};

//components to display on DisplayTree (right part)
const ProcessInfo = ({ selectedNodeToDisplay }) => {
    return (
        <div className="process-info-container">
            <Path selectedNodeToDisplay={selectedNodeToDisplay} />
            <Arguments selectedNodeToDisplay={selectedNodeToDisplay} />
            <Errors selectedNodeToDisplay={selectedNodeToDisplay} />
            <Artifacts selectedNodeToDisplay={selectedNodeToDisplay} />
            <ProcessId selectedNodeToDisplay={selectedNodeToDisplay} />
        </div>
    );
};

const TestSession = ({ selectedNodeToDisplay, prefix }) => {
    return (
        <div className="test-session-container">
            <Summary selectedNodeToDisplay={selectedNodeToDisplay} />
            <OverallResult selectedNodeToDisplay={selectedNodeToDisplay} />
            <Conclusion selectedNodeToDisplay={selectedNodeToDisplay} />
            <Command
                selectedNodeToDisplay={selectedNodeToDisplay}
                prefix={prefix}
            />
            <BuildUrl selectedNodeToDisplay={selectedNodeToDisplay} />
            <Artifacts selectedNodeToDisplay={selectedNodeToDisplay} />
            <Errors selectedNodeToDisplay={selectedNodeToDisplay} />
            <ProcessId selectedNodeToDisplay={selectedNodeToDisplay} />
        </div>
    );
};

const TestPlan = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <div className="blue bottom-space">
                Ready to run <strong>{selectedNodeToDisplay.tests.length}</strong>{" "}
          test(s):
        </div>
            {selectedNodeToDisplay.tests.map((item) => (
                <p className="selector" key={item}>
                    {item}
                </p>
            ))}
        </div>
    );
};

const TestSuite = ({ selectedNodeToDisplay, prefix }) => {
    return (
        <div className="test-suite-container">
            <Summary selectedNodeToDisplay={selectedNodeToDisplay} />
            <OverallResult selectedNodeToDisplay={selectedNodeToDisplay} />
            <Conclusion selectedNodeToDisplay={selectedNodeToDisplay} />
            <Name selectedNodeToDisplay={selectedNodeToDisplay} />
            <Scope selectedNodeToDisplay={selectedNodeToDisplay} />
            <Platform selectedNodeToDisplay={selectedNodeToDisplay} />
            <Command
                selectedNodeToDisplay={selectedNodeToDisplay}
                prefix={prefix}
            />
            <Artifacts selectedNodeToDisplay={selectedNodeToDisplay} />
            <Errors selectedNodeToDisplay={selectedNodeToDisplay} />
        </div>
    );
};

const TestGroup = ({ selectedNodeToDisplay }) => {
    return (
        <div className="test-group-container">
            <Name selectedNodeToDisplay={selectedNodeToDisplay} />
            <Errors selectedNodeToDisplay={selectedNodeToDisplay} />
        </div>
    );
};

const TestStatus = ({ selectedNodeToDisplay, prefix }) => {
    return (
        <div className="test-status-container">
            <Name selectedNodeToDisplay={selectedNodeToDisplay} />
            <OverallResult selectedNodeToDisplay={selectedNodeToDisplay} />
            <Message selectedNodeToDisplay={selectedNodeToDisplay} />
            <StackTrace selectedNodeToDisplay={selectedNodeToDisplay} />
            <Errors selectedNodeToDisplay={selectedNodeToDisplay} />
            <Command
                selectedNodeToDisplay={selectedNodeToDisplay}
                prefix={prefix}
            />
            <ImageComparison selectedNodeToDisplay={selectedNodeToDisplay} />
        </div>
    );
};

const Info = ({ selectedNodeToDisplay }) => {
    return (
        <div>
            <Message selectedNodeToDisplay={selectedNodeToDisplay} />
        </div>
    );
};

const LogEntry = ({ selectedNodeToDisplay }) => {
    return (
        <div>
            <Severity selectedNodeToDisplay={selectedNodeToDisplay} />
            <Message selectedNodeToDisplay={selectedNodeToDisplay} />
            <StackTrace selectedNodeToDisplay={selectedNodeToDisplay} />
            <Line selectedNodeToDisplay={selectedNodeToDisplay} />
            <File selectedNodeToDisplay={selectedNodeToDisplay} />
            <Errors selectedNodeToDisplay={selectedNodeToDisplay} />
            <ProcessId selectedNodeToDisplay={selectedNodeToDisplay} />
        </div>
    );
};

const MemoryLeaks = ({ selectedNodeToDisplay }) => {
    return (
        <div>
            <Phase selectedNodeToDisplay={selectedNodeToDisplay} />
            <MemoryLabels selectedNodeToDisplay={selectedNodeToDisplay} />
            <Errors selectedNodeToDisplay={selectedNodeToDisplay} />
            <Artifacts selectedNodeToDisplay={selectedNodeToDisplay} />
            <ProcessId selectedNodeToDisplay={selectedNodeToDisplay} />
        </div>
    );
};

//reusable components

const ProcessId = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <p>
                <span className="blue">Process id:</span>{" "}
                <strong>{selectedNodeToDisplay.processId}</strong>
            </p>
        </div>
    );
};

const Name = ({ selectedNodeToDisplay }) => {
    return (
        <div className="name display-margin">
            <span className="blue">Name:</span>{" "}
            <strong className="selector">{selectedNodeToDisplay.name}</strong>
        </div>
    );
};

const Path = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <div className="blue">Path: </div>
            <CopyToClipboard selectedNodeToDisplay={selectedNodeToDisplay} />
            <span className="selector">{selectedNodeToDisplay.path}</span>
        </div>
    );
};

const Arguments = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <div className="blue">Arguments: </div>
            <CopyToClipboard selectedNodeToDisplay={selectedNodeToDisplay} />
            <span className="selector">{selectedNodeToDisplay.arguments}</span>
        </div>
    );
};

const Errors = ({ selectedNodeToDisplay }) => {
    if (selectedNodeToDisplay.errors.length !== 0) {
        return (
            <div className="display-margin">
                <div className="blue">
                    Errors ({selectedNodeToDisplay.errors.length})
          </div>
                {selectedNodeToDisplay.errors.map((error) => (
                    <div key={error}>
                        <CopyToClipboard getData={error} />
                        <span className="statusFail selector">{error}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Artifacts = ({ selectedNodeToDisplay }) => {
    if (
        selectedNodeToDisplay.hasOwnProperty("artifacts") &&
        selectedNodeToDisplay.artifacts.length !== 0
    ) {
        return (
            <div className="display-margin">
                <span className="blue">
                    Artifacts ({selectedNodeToDisplay.artifacts.length})
          </span>
                <div className="artifact-div">
                    {selectedNodeToDisplay.artifacts.map((artifact) => (
                        <div key={artifact}>
                            <i className="fas fa-paperclip" />
                            <a href={artifact} target="_blank" rel="noreferrer">
                                {artifact}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const Summary = ({ selectedNodeToDisplay }) => {
    return (
        <div className="summary-container display-margin ">
            <div>
                Run <strong>{selectedNodeToDisplay.summary.testsCount}</strong>{" "}
          test(s).{" "}
            </div>
            <div>
                Passed:{" "}
                <strong>{selectedNodeToDisplay.summary.successCount}</strong>
            </div>
            <div>
                Failed:{" "}
                <strong>{selectedNodeToDisplay.summary.failedCount}</strong>
            </div>
            <div>
                Inconclusive:{" "}
                <strong>{selectedNodeToDisplay.summary.inconclusiveCount}</strong>
            </div>
            <div>
                Ignored:{" "}
                <strong>{selectedNodeToDisplay.summary.ignoredCount}</strong>
            </div>
            <div>
                Skipped:{" "}
                <strong>{selectedNodeToDisplay.summary.skippedCount}</strong>
            </div>
            <div>
                Not runnable:{" "}
                <strong>{selectedNodeToDisplay.summary.notRunCount}</strong>
            </div>
        </div>
    );
};

const OverallResult = ({ selectedNodeToDisplay }) => {
    if (selectedNodeToDisplay.type === "TestSession") {
        return (
            <div className="display-margin">
                <span className="blue">Overall results:</span>{" "}
                {selectedNodeToDisplay.summary.success ? (
                    <span className="statusSuccess">SUCCESS</span>
                ) : (
                        <span className="statusFail">FAIL</span>
                    )}
            </div>
        );
    } else if (selectedNodeToDisplay.type === "TestStatus") {
        switch (selectedNodeToDisplay.state) {
            case 0:
                return (
                    <div className="display-margin">
                        <span className="blue">Overall results:</span>{" "}
                        <StatusInconclusive status={"Inconclusive"} />
                    </div>
                );
            case 1:
            case 2:
            case 3:
            case 7:
                return (
                    <div className="display-margin">
                        <span className="blue">Overall results:</span>{" "}
                        <StatusIgnored status={"Ignored"} />
                    </div>
                );
            case 4:
                return (
                    <div className="display-margin">
                        <span className="blue">Overall results:</span>{" "}
                        <StatusSuccess status={"Success"} />
                    </div>
                );
            case 5:
            case 6:
                return (
                    <div className="display-margin">
                        <span className="blue">Overall results:</span>{" "}
                        <StatusFail status={"Failed"} />
                    </div>
                );
            default:
                return null;
        }
    } else if (selectedNodeToDisplay.type === "TestSuite") {
        return (
            <div className="display-margin">
                <span className="blue">Overall results:</span>{" "}
                {selectedNodeToDisplay.errors.length === 0 ? (
                    <span className="statusSuccess">SUCCESS</span>
                ) : (
                        <span className="statusFail">FAIL</span>
                    )}
            </div>
        );
    }
};

const Conclusion = ({ selectedNodeToDisplay }) => {
    if (selectedNodeToDisplay.type === "TestSession") {
        return (
            <div className="display-margin">
                <span className="blue">Conclusion:</span>{" "}
                {!selectedNodeToDisplay.summary.success ? (
                    <span className="statusFail">
                        {selectedNodeToDisplay.summary.failureConclusion}
                    </span>
                ) : (
                        <span className="statusSuccess">SUCCESS</span>
                    )}
            </div>
        );
    } else if (selectedNodeToDisplay.type === "TestSuite") {
        return (
            <div className="display-margin">
                <span className="blue">Conclusion:</span>{" "}
                {
                    <span className="statusFail">
                        {selectedNodeToDisplay.summary.failureReasons[2]}
                    </span>
                }
            </div>
        );
    } else {
        return null;
    }
};

// const Suites = ({ selectedNodeToDisplay }) => {
//     return (
//         <div className="display-margin">
//             <span className="blue">Suites count:</span>{" "}
//             <strong>{selectedNodeToDisplay.summary.suitesCount}</strong>
//         </div>
//     );
// };

const Command = ({ selectedNodeToDisplay, prefix }) => {
    if (selectedNodeToDisplay.minimalCommandLine.length !== 0) {
        return (
            <div className="display-margin">
                <div className="blue">Command to run locally: </div>
                <CopyToClipboard
                    getData={selectedNodeToDisplay.minimalCommandLine}
                />
                <span className="selector">
                    {prefix}
                    {selectedNodeToDisplay.minimalCommandLine.map((command) => (
                        <span key={command}>{command} </span>
                    ))}
                </span>
            </div>
        );
    }
    return null;
};

const Scope = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <span className="blue">Scope:</span>{" "}
            <strong>{selectedNodeToDisplay.scope}</strong>
        </div>
    );
};

const Platform = ({ selectedNodeToDisplay }) => {
    if (selectedNodeToDisplay.platform !== null) {
        return (
            <div className="display-margin">
                <span className="blue">Platform:</span>{" "}
                <strong>{selectedNodeToDisplay.platform}</strong>
            </div>
        );
    }
    return null;
};

const CopyToClipboard = ({ getData }) => {
    const handleTextClick = () => {
        navigator.clipboard.writeText(getData);
    };

    return (
        <div className="copy-btn-container">
            <button
                className="btn-copy"
                name="btn-copy"
                onClick={handleTextClick}
            >
                Copy{" "}
                <i className="fas fa-clipboard-check" style={{ size: 10 }}></i>
            </button>
        </div>
    );
};

const Message = ({ selectedNodeToDisplay }) => {
    if (selectedNodeToDisplay.message.length !== 0) {
        const message = selectedNodeToDisplay.message.split(/\r?\n/);
        return (
            <div className="display-margin">
                <div className="blue bottom-space">Message:</div>
                <span className="selector">
                    {message.map((msg) => (
                        <div>{msg}</div>
                    ))}
                </span>
            </div>
        );
    }
    return null;
};

const StackTrace = ({ selectedNodeToDisplay }) => {
    if (
        selectedNodeToDisplay.hasOwnProperty("stackTrace2") &&
        selectedNodeToDisplay.stackTrace2.length !== 0
    ) {
        return (
            <div className="display-margin">
                <div className="blue bottom-space">Stack-trace:</div>
                {selectedNodeToDisplay.stackTrace2.map((item) => (
                    <div>
                        At {item.method} in
                        <a href={item.ref} target="_blank" rel="noreferrer">
                            {item.file}:{item.line}
                        </a>
                    </div>
                ))}
            </div>
        );
    } else if (
        selectedNodeToDisplay.type === "LogEntry" &&
        selectedNodeToDisplay.stacktrace.length !== 0
    ) {
        return (
            <div className="display-margin">
                <div className="blue bottom-space">Stack-trace:</div>
                <div className="selector">{selectedNodeToDisplay.stacktrace}</div>
            </div>
        );
    } else if (selectedNodeToDisplay.stackTrace.length !== 0) {
        return (
            <div className="display-margin">
                <div className="blue bottom-space">Stack-trace:</div>
                <div className="selector">{selectedNodeToDisplay.stackTrace}</div>
            </div>
        );
    }
    return null;
};

const Severity = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <span className="blue">Severity: </span>
            <span>{selectedNodeToDisplay.severity}</span>
        </div>
    );
};

const Line = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <span className="blue">Line:</span>
            <span>{selectedNodeToDisplay.line}</span>
        </div>
    );
};

const File = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <div className="blue">File:</div>
            <div className="selector">{selectedNodeToDisplay.file}</div>
        </div>
    );
};

const Phase = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <span className="blue">Phase: </span>
            <span>{selectedNodeToDisplay.phase}</span>
        </div>
    );
};

const MemoryLabels = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <div className="blue">Memory labels: </div>
            {selectedNodeToDisplay.memoryLabels.map((label) =>
                Object.keys(label).map((key, i) => (
                    <div key={i}>
                        <span>{key}</span> : <span>{label[key]}</span>
                    </div>
                ))
            )}
        </div>
    );
};

const BuildUrl = ({ selectedNodeToDisplay }) => {
    return (
        <div className="display-margin">
            <div className="blue">Build URL: </div>
            <i className="fas fa-paperclip" />
            <a href={selectedNodeToDisplay.buildUrl} target="_blank" rel='noreferrer'>
                {selectedNodeToDisplay.buildUrl}
            </a>
        </div>
    );
};

// Image Comparison tool
const ImageComparison = ({ selectedNodeToDisplay }) => {
    if (selectedNodeToDisplay.artifacts.length > 0) {
        const images = selectedNodeToDisplay.artifacts;
        const [header, setHeader] = useState({
            index: 0,
            headersList: ["Rendered", "Expected", "Difference"],
        });
        const [image, setImage] = useState({
            index: 0,
            imageList: images,
        });

        const loadRenderedImage = () => {
            let newHeader = { ...header };
            newHeader.index = 0;
            setHeader(newHeader);

            let newImage = { ...image };
            newImage.index = 0;
            setImage(newImage);
        };

        const loadExpectedImage = () => {
            console.log("mouse down");
            let newHeader = { ...header };
            newHeader.index = 1;
            setHeader(newHeader);

            let newImage = { ...image };
            newImage.index = 1;
            setImage(newImage);
        };

        const loadDiffImage = () => {
            let newHeader = { ...header };
            newHeader.index = 2;
            setHeader(newHeader);

            let newImage = { ...image };
            newImage.index = 2;
            setImage(newImage);
        };

        return (
            <div className="display-margin">
                <div className="blue">Images Comparison:</div>
                <ImageContainer>
                    <ImageHeader headerText={header.headersList[header.index]} />
                    <ImageDisplay image={image.imageList[image.index]} />
                    <Buttons>
                        <Button
                            onMouseDown={loadExpectedImage}
                            onMouseUp={loadRenderedImage}
                        >
                            Expected
              </Button>
                        <Button
                            onMouseDown={loadDiffImage}
                            onMouseUp={loadRenderedImage}
                        >
                            Difference
              </Button>
                    </Buttons>
                </ImageContainer>
            </div>
        );
    }

    return null;
};

const ImageContainer = ({ children }) => {
    return <div className="comparison-container">{children}</div>;
};

const ImageHeader = ({ headerText }) => {
    return <h4 className="header">{headerText}</h4>;
};

export const ImageDisplay = ({ image }) => {
    return (
        <div className="image">
            <div className="imagePath">Path: {image}</div>
            <img src={image} />
        </div>
    );
};

const Buttons = ({ children }) => {
    return <div className="buttons">{children}</div>;
};

const Button = ({ onMouseDown, onMouseUp, children }) => (
    <button className="btn" onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
        {children}
    </button>
);

//Resizable SplitPane component

const splitPaneContext = React.createContext();

const SplitPane = ({ children, ...props }) => {
    const [leftWidth, setLeftWidth] = useState(null);

    const separatorXPosition = React.useRef(null);
    const splitPaneRef = React.createRef();

    const onMouseDown = (e) => {
        e.preventDefault();
        separatorXPosition.current = e.clientX;
    };

    const onMouseMove = (e) => {
        e.preventDefault();
        if (!separatorXPosition.current) {
            return;
        }

        const newLeftWidth =
            leftWidth + e.clientX - separatorXPosition.current;
        separatorXPosition.current = e.clientX;
        setLeftWidth(newLeftWidth);
    };

    const onMouseUp = () => {
        separatorXPosition.current = null;
    };

    useEffect(() => {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    });

    return (
        <div {...props} className="split-pane" ref={splitPaneRef}>
            <splitPaneContext.Provider value={{ leftWidth, setLeftWidth }}>
                {children[0]}
                <div className="separator" onMouseDown={onMouseDown} />
                {children[1]}
            </splitPaneContext.Provider>
        </div>
    );
};

SplitPane.Left = function SplitPaneLeft(props) {
    const leftRef = React.createRef();
    const { leftWidth, setLeftWidth } = React.useContext(splitPaneContext);
    useEffect(() => {
        if (!leftWidth) {
            setLeftWidth(leftRef.current.clientWidth);
            leftRef.current.style.flex = "none";
            return;
        }
        leftRef.current.style.width = `${leftWidth}px`;
    }, [leftWidth]);

    console.log(leftWidth);
    return <div {...props} className="split-pane-left" ref={leftRef} />;
};

SplitPane.Right = function SplitPaneRight(props) {
    return <div {...props} className="split-pane-right" />;
};

export default Root