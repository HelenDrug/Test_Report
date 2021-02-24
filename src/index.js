import React, { createContext } from 'react'
import ReactDOM from 'react-dom'
import App from './components/App.jsx'

export const TestDataContext = createContext("context");

window.RenderTestReport = (data) => {
    ReactDOM.render((
        <TestDataContext.Provider value={data}>
            <App />
        </TestDataContext.Provider>
    ), document.getElementById('root'));
}

