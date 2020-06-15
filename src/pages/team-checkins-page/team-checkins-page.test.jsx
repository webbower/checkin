import render from 'riteway/render-component';
import { describe } from 'riteway';

import { TeamCheckinsPage } from './team-checkins-page.jsx';

const renderTestComponent = ({ pageTitle = 'Test', team = {} } = {}) =>
  render(<TeamCheckinsPage pageTitle={pageTitle} team={team} />);

const createTestTeam = ({ id = '1', name = 'The First Team', checkins = [] } = {}) => ({
  id,
  name,
  checkins,
});

describe('<TeamCheckinsPage> output', async (assert) => {
  const checkinCreatedAtTimestamp = 1591044882455;

  {
    const team = createTestTeam();
    const $ = renderTestComponent({ team });

    assert({
      given: 'team data',
      should: 'display team data message',
      actual: $('h3').first().text(),
      expected: team.name,
    });

    assert({
      given: 'no checkins',
      should: 'display empty checkins message',
      actual: $('.empty-message-checkins').length,
      expected: 1,
    });
  }

  {
    const team = createTestTeam({
      checkins: [
        {
          id: '1',
          user: 'Jane',
          createdAt: checkinCreatedAtTimestamp,
          tasks: [
            {
              id: '1',
              description: 'Build Checkin App',
              completed: false,
            },
            {
              id: '2',
              description: 'Migrate to Next.js',
              completed: true,
            },
          ],
          blockers: [
            {
              id: '1',
              description: 'My dog ate my code',
            },
          ],
        },
        {
          id: '2',
          user: 'Bob',
          createdAt: checkinCreatedAtTimestamp + 1000,
          tasks: [
            {
              id: '3',
              description: 'Build Checkin App',
              completed: false,
            },
            {
              id: '4',
              description: 'Migrate to Next.js',
              completed: true,
            },
          ],
          blockers: [
            {
              id: '2',
              description: 'My dog ate my code',
            },
          ],
        },
      ],
    });
    const $ = renderTestComponent({ team });

    assert({
      given: 'team data with checkins',
      should: 'display all checkins for team',
      actual: [$('.checkins-feed').length, $('.checkins-feed > li').length],
      expected: [1, 2],
    });

    assert({
      given: 'team data with checkins',
      should: 'display tasks for each checkin',
      actual: $('.checkins-feed').find('.tasks-list').find('li').length,
      expected: 4,
    });

    assert({
      given: 'team data with checkins',
      should: 'display completed state for each task',
      actual: [
        $('.tasks-list').find('li').filter('.is-completed').length,
        $('.tasks-list').find('li').filter(':not(.is-completed)').length,
      ],
      expected: [2, 2],
    });

    assert({
      given: 'team data with checkins',
      should: 'display blockers for each checkin',
      actual: $('.checkins-feed').find('.blockers-list').find('li').length,
      expected: 2,
    });
  }

  {
    const team = createTestTeam({
      checkins: [
        {
          id: '1',
          user: 'Jane',
          createdAt: checkinCreatedAtTimestamp,
          tasks: [],
          blockers: [
            {
              id: '1',
              description: 'My dog ate my code',
            },
          ],
        },
        {
          id: '2',
          user: 'Bob',
          createdAt: checkinCreatedAtTimestamp + 1000,
          tasks: [
            {
              id: '3',
              description: 'Build Checkin App',
              completed: false,
            },
            {
              id: '4',
              description: 'Migrate to Next.js',
              completed: true,
            },
          ],
          blockers: [],
        },
      ],
    });
    const $ = renderTestComponent({ team });

    assert({
      given: 'a checkin with no tasks',
      should: 'display empty tasks message',
      actual: [$('.empty-message-tasks').length, $('.tasks-list').length],
      expected: [1, 1],
    });

    assert({
      given: 'a checkin with no blockers',
      should: 'display nothing for blockers for the checkin',
      actual: $('.blockers-list').length,
      expected: 1,
    });
  }
});
