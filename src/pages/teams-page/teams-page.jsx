import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Layout } from '../../components/layout';
import { Heading } from '../../components/heading';

import { getTeamsList } from '../../redux';

const propTypes = {
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      users: PropTypes.arrayOf(PropTypes.string),
    })
  ),
};

const defaultProps = {
  teams: [],
};

const mapStateToProps = state => ({
  teams: getTeamsList(state),
});

const TeamsPage = ({ teams }) => (
  <Layout pageTitle="Manage Teams">
    <Heading level={2}>Teams</Heading>

    <form>
      <table className="teams-list">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Users</th>
            <th scope="col">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {teams.length < 1 ? (
            <tr>
              <td colSpan="4">
                <p className="empty-message">No teams. Create one.</p>
              </td>
            </tr>
          ) : (
            teams.map(({ id, name, users }) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{name}</td>
                <td>{users.join(', ')}</td>
                <td>&nbsp;</td>
              </tr>
            ))
          )}
          <tr>
            <td>&nbsp;</td>
            <td>
              <p>
                <label htmlFor="teamname" className="vh">
                  Name
                </label>
                <input type="text" name="teamname" id="teamname" />
              </p>
            </td>
            <td>&nbsp;</td>
            <td>
              <button type="submit">Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  </Layout>
);

TeamsPage.propTypes = propTypes;
TeamsPage.defaultProps = defaultProps;

export { TeamsPage };
export default connect(mapStateToProps)(TeamsPage);
