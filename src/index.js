import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

import {Provider} from 'react-redux';
import {createStore} from 'redux';

const levelReducer = (state, action) => {
    console.log("STATE:  " + JSON.stringify(state, null, 5));
    console.log("ACTION: " + JSON.stringify(action, null, 5));
    switch(action.type) {
        case "ADD_TILE": {
            let tileSet = [...state.tileSet, action.tile];
            localStorage.setItem("tileSet", JSON.stringify(tileSet));
            return {...state, tileSet};
        }
        case "DELETE_TILE":{
            let tileSet = [...state.tileSet];
            tileSet.splice(action.index, 1);
            localStorage.setItem("tileSet", JSON.stringify(tileSet));
            return {...state, tileSet};
        }
        default: {
            return {...state};
        }
    }
}

let initialTileSet = localStorage.getItem("tileSet") ? JSON.parse(localStorage.getItem("tileSet")) : [];

const store = createStore(levelReducer, {
    tileSet: initialTileSet
});

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
