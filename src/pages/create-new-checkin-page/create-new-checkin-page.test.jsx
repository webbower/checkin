import render from 'riteway/render-component';
import { describe } from 'riteway';

import { CreateNewCheckinPage } from './create-new-checkin-page.jsx';

const renderTestComponent = ({ step = 0, previousCheckin } = {}) =>
  render(<CreateNewCheckinPage step={step} previousCheckin={previousCheckin} />);

const taskDesc1 = 'Write the README for the checkin app';
const taskDesc2 = 'Document the stack requirements';
const taskDesc3 = 'Complete 2 code reviews';

const blockerDesc1 = 'My dog ate my code';

const checkinCreatedAtTimestamp = 1591044882455;

describe('<CreateNewCheckinPage>', async (assert) => {
  {
    const $ = renderTestComponent({
      previousCheckin: {
        id: '3',
        user: 'Matt',
        createdAt: checkinCreatedAtTimestamp,
        tasks: [
          { id: '1', description: taskDesc1, completed: true },
          { id: '2', description: taskDesc2, completed: false },
          { id: '3', description: taskDesc3, completed: false },
        ],
        blockers: [{ id: '1', description: blockerDesc1 }],
      },
    });

    assert({
      given: 'starting the new checkin process and a past checkin exists with tasks',
      should: 'render the tasks',
      actual: [
        $('.tasks-list').text().includes(taskDesc1),
        $('.tasks-list').text().includes(taskDesc2),
        $('.tasks-list').text().includes(taskDesc3),
        $('.tasks-list')
          .find('input[type="checkbox"]')
          .filter((_, el) => $(el).prop('checked')).length,
      ],
      expected: [true, true, true, 1],
    });

    assert({
      given: 'starting the new checkin process and a past checkin exists with blockers',
      should: 'render the blockers',
      actual: $('.blockers-list').text().includes(blockerDesc1),
      expected: true,
    });
  }
});
