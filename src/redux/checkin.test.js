import { describe } from 'riteway';
import { default as reducer, addUser } from './checkin.js';

// TODO 26-05
// - Replace `expected: getInitialState()` with test-only `createState()` factory
// - Replace actionCreator().payload references in `expected` keys with test shape creators
// - Principle of Least Knowledge!! (Need to know basis)
// - Don't refactor out state slices. State is not complex enough.
// - Action creators can conditionally dispatch one of multiple possible actions

const createTestState = ({ users = {} } = {}) => ({
  users,
});

const createTestUser = ({ id = '0', name = 'Anonymous' } = {}) => ({ id, name });

describe('checkin: reducer()', async (assert) => {
  assert({
    given: 'no arguments',
    should: 'return initial state',
    actual: reducer(),
    expected: createTestState(),
  });
});

describe('checkin: adding users', async (assert) => {
  assert({
    given: 'an addUser action',
    should: 'add the new user to the state',
    actual: reducer(undefined, addUser({ id: '1' })),
    expected: createTestState({
      users: {
        '1': createTestUser({ id: '1' }),
      },
    }),
  });

  assert({
    given: 'multiple addUser actions',
    should: 'add all users to the state',
    actual: ['1', '2', '3'].map((id) => addUser({ id })).reduce(reducer, reducer()),
    expected: createTestState({
      users: {
        '1': createTestUser({ id: '1' }),
        '2': createTestUser({ id: '2' }),
        '3': createTestUser({ id: '3' }),
      },
    }),
  });
});
