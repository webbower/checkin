import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { format } from 'date-fns';

import { CheckinsSectionLayout } from '../../components/layout';
import { Heading } from '../../components/heading';

import { getTeamCheckinSummary } from '../../redux';

const mapStateToProps = (state, ownProps) => ({
  team: getTeamCheckinSummary(ownProps.router.query.id)(state),
});

const tasksShape = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
  })
).isRequired;

const blockersShape = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  })
).isRequired;

const propTypes = {
  team: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    checkins: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        user: PropTypes.string.isRequired,
        createdAt: PropTypes.number.isRequired,
        tasks: tasksShape,
        blockers: blockersShape,
      })
    ),
  }),
};

const TeamCheckinsPage = ({ team }) => {
  return (
    <CheckinsSectionLayout pageTitle={`Checkins for ${team.name}`}>
      <section>
        <Heading level={3}>{team.name}</Heading>

        {team.checkins.length < 1 ? (
          <p className="empty-message-checkins">No checkins for this team. Create one</p>
        ) : (
          <ol className="checkins-feed">
            {team.checkins.map(checkin => (
              <li key={checkin.id}>
                <Heading level={4}>
                  Checkin by {checkin.user} on {format(checkin.createdAt, 'MMM d, y')}
                </Heading>

                {checkin.tasks.length > 0 ? (
                  <>
                    <Heading level={5}>Tasks:</Heading>
                    <ul className="tasks-list">
                      {checkin.tasks.map(task => (
                        <li key={task.id} className={task.completed ? 'is-completed' : undefined}>
                          <span>{task.completed ? '✅' : '❌'}</span> {task.description}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="empty-message-tasks">No tasks for this Checkin</p>
                )}

                {checkin.blockers.length > 0 && (
                  <>
                    <Heading level={5}>Blockers:</Heading>
                    <ul className="blockers-list">
                      {checkin.blockers.map(blocker => (
                        <li key={blocker.id}>{blocker.description}</li>
                      ))}
                    </ul>
                  </>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </CheckinsSectionLayout>
  );
};

TeamCheckinsPage.propTypes = propTypes;

export { TeamCheckinsPage };
export default compose(withRouter, connect(mapStateToProps))(TeamCheckinsPage);
