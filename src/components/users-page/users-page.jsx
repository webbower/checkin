import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Heading } from '../heading';
import { getUsersList } from '../../redux';

const propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

const defaultProps = {
  users: [],
};

const mapStateToProps = (state) => ({
  users: getUsersList(state),
});

const UsersPage = ({ users }) => (
  <div>
    <Heading level={2}>Users</Heading>

    <form>
      <table className="users-list">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {users.length < 1 ? (
            <tr>
              <td colSpan="3">
                <p className="empty-message">No users. Create one.</p>
              </td>
            </tr>
          ) : (
            users.map(({ id, name }) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{name}</td>
                <td>&nbsp;</td>
              </tr>
            ))
          )}
          <tr>
            <td>&nbsp;</td>
            <td>
              <p>
                <label htmlFor="username" className="vh">
                  Name
                </label>
                <input type="text" name="username" id="username" />
              </p>
            </td>
            <td>
              <button type="submit">Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
);

UsersPage.propTypes = propTypes;
UsersPage.defaultProps = defaultProps;

export { UsersPage };
export default connect(mapStateToProps)(UsersPage);
