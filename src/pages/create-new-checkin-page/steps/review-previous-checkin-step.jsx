import PropTypes from 'prop-types';

const propTypes = {
  checkin: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
    createdAt: PropTypes.number.isRequired,
    tasks: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
      })
    ).isRequired,
    blockers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
  onComplete: PropTypes.func.isRequired,
};

const ReviewPreviousCheckinStep = ({ checkin, onComplete }) => {
  const { tasks, blockers } = checkin;

  return (
    <div>
      <section>
        <p>Your last checkin said you would:</p>

        {tasks.length > 0 && (
          <ul className="js-tasks tasks-list">
            {tasks.map(({ id, description, completed }) => (
              <li key={id}>
                <label>
                  <input type="checkbox" value={id} defaultChecked={completed} /> {description}
                </label>
              </li>
            ))}
          </ul>
        )}

        <form>
          <p>
            <button type="submit">+</button>
            <input type="text" placeholder="Add another item you completed on the previous day" />
          </p>
        </form>
      </section>

      <section>
        <p>Were there any blockers? If so, please list briefly below (one line each):</p>

        {blockers.length > 0 && (
          <ul className="js-blockers blockers-list">
            {blockers.map(({ id, description }) => (
              <li key={id}>{description}</li>
            ))}
          </ul>
        )}

        <form>
          <p>
            <button type="button">+</button>
            <input type="text" placeholder="Add a blocker from your previous checkin" />
          </p>
        </form>
      </section>

      <p>Please check the items you completed, and add any additional items you completed.</p>

      <div>
        <button
          type="button"
          onClick={() => {
            onComplete();
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

ReviewPreviousCheckinStep.propTypes = propTypes;

export default ReviewPreviousCheckinStep;
