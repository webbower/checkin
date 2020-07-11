import { describe } from 'riteway';

import prop from './prop.js';

describe('prop()', async assert => {
  assert({
    given: 'a string argument on first call',
    should: 'return a function',
    actual: typeof prop('foo'),
    expected: 'function',
  });

  assert({
    given:
      'a string argument on first call and an object that contains that string as a key on second call',
    should: 'return the value in the object at that key',
    actual: prop('foo')({ foo: 1 }),
    expected: 1,
  });

  assert({
    given:
      'a string argument on first call and an object that does not contain that string as a key on second call',
    should: 'return undefined',
    actual: prop('bar')({ foo: 1 }),
    expected: undefined,
  });
});
