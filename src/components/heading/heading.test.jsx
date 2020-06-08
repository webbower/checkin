import React from 'react';
import render from 'riteway/render-component';
import { describe } from 'riteway';

import Heading from './heading.jsx';

describe('<Heading> output', async (assert) => {
  [1, 2, 3, 4, 5, 6].forEach((level) => {
    const $ = render(<Heading level={level}>Hello!</Heading>);

    assert({
      given: `a valid 'level' prop of ${level}`,
      should: 'render a valid heading element',
      actual: $('body :first-child').is(`h${level}`),
      expected: true,
    });
  });
});
