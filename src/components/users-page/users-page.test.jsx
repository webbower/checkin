import React from 'react';
import render from 'riteway/render-component';
import { describe } from 'riteway';

import { UsersPage } from './users-page.jsx';

import { createTestUser } from '../../redux/testing-utils.js';

describe('<UsersPage> output', async (assert) => {
  {
    const $ = render(<UsersPage />);

    assert({
      given: 'no users',
      should: 'display empty message',
      actual: $('.empty-message').length,
      expected: 1,
    });

    assert({
      given: 'no users',
      should: 'display add user fields',
      actual: [$('#username').length, $('button[type="submit"]').length],
      expected: [1, 1],
    });
  }

  {
    const $ = render(<UsersPage users={[createTestUser({ id: '12345', name: 'Bob' })]} />);

    assert({
      given: 'an array of users',
      should: 'not display empty message',
      actual: $('.empty-message').length,
      expected: 0,
    });

    assert({
      given: 'an array of users',
      should: 'display the list of users',
      actual: [
        $('.users-list').text().trim().includes('12345'),
        $('.users-list').text().trim().includes('Bob'),
      ],
      expected: [true, true],
    });

    assert({
      given: 'an array of users',
      should: 'display add user fields',
      actual: [$('#username').length, $('button[type="submit"]').length],
      expected: [1, 1],
    });
  }
});
