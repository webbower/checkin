import { createStore } from 'redux';

import { default as reducer, getInitialState } from './checkin.js';

const configureStore = (initialState = getInitialState()) => createStore(reducer, initialState);

export default configureStore;
