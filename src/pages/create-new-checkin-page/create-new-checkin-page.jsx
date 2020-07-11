import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getMostRecentCheckinForUser, getCurrentUserId } from '../../redux';

import { CheckinsSectionLayout } from '../../components/layout';
import { Heading } from '../../components/heading';
import ReviewPreviousCheckinStep from './steps/review-previous-checkin-step.jsx';
// import CreateNewCheckinStep from './steps/create-new-checkin-step.jsx';

const mapStateToProps = state => {
  const currentUserId = getCurrentUserId(state);
  return {
    step: 0,
    previousCheckin: getMostRecentCheckinForUser(currentUserId, state),
  };
};

const propTypes = {
  step: PropTypes.oneOf([0, 1, 2, 3]).isRequired,
  previousCheckin: PropTypes.shape({
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
};

const steps = [
  {
    component: ReviewPreviousCheckinStep,
    getPropsForComponent: ({ previousCheckin }) => ({ checkin: previousCheckin }),
  },
];

const CreateNewCheckinPage = props => {
  const stepConfig = steps[props.step];
  if (!stepConfig) {
    throw new TypeError(
      `An invalid step identifier was passed to 'CreateNewCheckinPage': ${props.step}`
    );
  }

  const { component: StepComponent, getPropsForComponent } = stepConfig;

  return (
    <CheckinsSectionLayout pageTitle="Create a checkin">
      <Heading level={3}>Create a checkin</Heading>

      <StepComponent {...getPropsForComponent(props)} />
    </CheckinsSectionLayout>
  );
};

CreateNewCheckinPage.propTypes = propTypes;

export { CreateNewCheckinPage };
export default connect(mapStateToProps)(CreateNewCheckinPage);
