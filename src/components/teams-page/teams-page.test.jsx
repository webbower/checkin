import React from 'react';
import render from 'riteway/render-component';
import { describe } from 'riteway';

import { TeamsPage } from './teams-page.jsx';

describe('<TeamsPage> output', async (assert) => {
  {
    const $ = render(<TeamsPage />);

    assert({
      given: 'no teams',
      should: 'display empty message',
      actual: $('.empty-message').length,
      expected: 1,
    });

    assert({
      given: 'no teams',
      should: 'display add team fields',
      actual: [$('#teamname').length, $('button[type="submit"]').length],
      expected: [1, 1],
    });
  }

  {
    const $ = render(
      <TeamsPage
        teams={[
          {
            id: '12345',
            name: 'The First Team',
            users: ['Jane', 'Bob'],
          },
        ]}
      />
    );

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
        $('.teams-list').text().includes('12345'),
        $('.teams-list').text().includes('The First Team'),
        $('.teams-list').text().includes('Jane, Bob'),
      ],
      expected: [true, true, true],
    });

    assert({
      given: 'an array of teams',
      should: 'display add user fields',
      actual: [$('#teamname').length, $('button[type="submit"]').length],
      expected: [1, 1],
    });
  }
});
