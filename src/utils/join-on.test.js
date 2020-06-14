import { describe } from 'riteway';

import joinOn from './join-on.js';

describe('joinOn()', async (assert) => {
  assert({
    given: 'an object argument on first call',
    should: 'return a function',
    actual: typeof joinOn({}),
    expected: 'function',
  });

  assert({
    given:
      'an object argument on first call and a string that matches a key in the object on second call',
    should: 'return the value in the object at that key',
    actual: joinOn({ foo: 1 })('foo'),
    expected: 1,
  });

  assert({
    given:
      'an object argument on first call and a string that matches no keys in the object on second call',
    should: 'return undefined',
    actual: joinOn({ foo: 1 })('bar'),
    expected: undefined,
  });
});
