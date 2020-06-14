import { describe } from 'riteway';

import pipe from './pipe';

const identity = (x) => x;
const first = (str) => str[0];
const toUpper = (str) => str.toUpperCase();

describe('pipe()', async (assert) => {
  assert({
    given: 'a function argument',
    should: 'return a function',
    actual: typeof pipe(identity),
    expected: 'function',
  });

  assert({
    given:
      'a function argument for first call and a single argument for second call [pipe(identity)(1)]',
    should: 'return the expected value',
    actual: pipe(identity)(1),
    expected: 1,
  });

  assert({
    given:
      'multiple function arguments for first call and a single argument for second call [pipe(first, toUpper)("bob smith")]',
    should: 'return the expected value',
    actual: pipe(first, toUpper)('bob smith'),
    expected: 'B',
  });

  {
    const getInitial = pipe(first, toUpper);
    const join = (glue) => (list) => list.join(glue);
    const split = (splitter) => (str) => str.split(splitter);
    const map = (fn) => (mappable) => mappable.map(fn);
    const take = (n) => (list) => list.slice(0, n);
    const getInitials = pipe(split(/\s+/), take(2), map(getInitial), join(''));

    assert({
      given: 'function arguments that have been composed earlier',
      should: 'be composable the same as base unit functions',
      actual: getInitials('bob smith'),
      expected: 'BS',
    });
  }
});
