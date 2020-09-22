import render from 'riteway/render-component';
import { describe } from 'riteway';

import { CheckinsIndexPage } from './checkins-index-page.jsx';

const renderTestComponent = ({ pageTitle = 'Test', teams = [] } = {}) =>
  render(<CheckinsIndexPage pageTitle={pageTitle} teams={teams} />);

describe('<CheckinsIndexPage> output', async assert => {
  {
    const $ = renderTestComponent();

    assert({
      given: 'no teams',
      should: 'display empty message',
      actual: $('.empty-message').length,
      expected: 1,
    });
  }

  {
    const teamId = '12345';
    const teamName = 'The First Team';
    const $ = renderTestComponent({
      teams: [
        {
          id: teamId,
          name: teamName,
          users: ['Jane', 'Bob'],
        },
      ],
    });

    assert({
      given: 'an array of teams',
      should: 'not display empty message',
      actual: $('.empty-message').length,
      expected: 0,
    });

    assert({
      given: 'an array of teams',
      should: 'display the list of teams',
      actual: [
        $('.teams-list').text().includes(teamId),
        $('.teams-list').text().includes(teamName),
        $('.teams-list').text().includes('View Checkins'),
      ],
      expected: [true, true, true],
    });
  }
});
