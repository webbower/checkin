import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import { Provider } from 'react-redux';

import { configureStore, getInitialState } from './redux';

const store = configureStore(
  getInitialState({
    users: {
      '1': {
        id: '1',
        name: 'Matt',
      },
    },
    team: {
      '1': {
        id: '1',
        name: 'The First Team',
        ownerId: '1',
        users: ['1'],
      },
    },
  })
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
