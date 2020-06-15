import PropTypes from 'prop-types';
import Link from 'next/link';
import { connect } from 'react-redux';

import { CheckinsSectionLayout } from '../../components/layout';
import { Heading } from '../../components/heading';

import { getTeamsList } from '../../redux';

const mapStateToProps = (state) => ({
  teams: getTeamsList(state),
});

const propTypes = {
  teams: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      users: PropTypes.arrayOf(PropTypes.string),
    })
  ),
};

function CheckinsIndexPage({ teams }) {
  return (
    <CheckinsSectionLayout pageTitle="Checkins">
      <Heading level={3}>Teams</Heading>

      {teams.length < 1 ? (
        <p className="empty-message">
          No teams to checkin for.{' '}
          <Link href="/teams.html">
            <a>Create a team.</a>
          </Link>
        </p>
      ) : (
        <table className="teams-list">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(({ id, name }) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{name}</td>
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </CheckinsSectionLayout>
  );
}

CheckinsIndexPage.propTypes = propTypes;

export { CheckinsIndexPage };
export default connect(mapStateToProps)(CheckinsIndexPage);
