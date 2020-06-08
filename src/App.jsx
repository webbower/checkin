import React from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.css';

import { UsersPage } from './components/users-page';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="App">
          <nav>
            <ul>
              <li>
                <Link to="/users.html">Users</Link>
              </li>
            </ul>
          </nav>
          <Switch>
            <Route path="/users.html">
              <UsersPage />
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default hot(module)(App);
