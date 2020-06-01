import { describe } from 'riteway';
import { default as reducer, addUser, addTeam, addCheckin } from './checkin.js';

// TODO 26-05
// √ Replace `expected: getInitialState()` with test-only `createTestState()` factory
// √ Replace actionCreator().payload references in `expected` keys with test shape creators
// √ Principle of Least Knowledge!! (Need to know basis)
// √ Don't refactor out state slices. State is not complex enough.
// - Action creators can conditionally dispatch one of multiple possible actions

const createTestState = ({ users = {}, teams = {}, checkins = [] } = {}) => ({
  users,
  teams,
  checkins,
});

const createTestUser = ({ id = '0', name = 'Anonymous' } = {}) => ({ id, name });

const createTestTeam = ({ id = '0', name = 'Team 1', ownerId = '0', users = [] } = {}) => ({
  id,
  name,
  ownerId,
  users,
});

const createTestCheckin = ({
  id = '0',
  userId = '0',
  teamId = '0',
  createdAt = Date.now(),
  tasks = [],
  blockers = [],
} = {}) => ({
  id,
  userId,
  teamId,
  createdAt,
  tasks,
  blockers,
});

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

describe('checkin: adding teams', async (assert) => {
  const owner = createTestUser({ id: '1' });

  // TODO Should addTeams() add the team if users[ownerId] doesn't exist?
  assert({
    given: 'an addTeam action when the owner does not exist',
    should: 'not modify the state',
    actual: reducer(reducer(), addTeam({ id: '1', ownerId: owner.id })),
    expected: createTestState(),
  });

  assert({
    given: 'an addTeam action with an existing owner',
    should: 'add the team and add the user who created the team to the new team',
    actual: [addUser({ ...owner }), addTeam({ id: '1', ownerId: owner.id })].reduce(
      reducer,
      reducer()
    ),
    expected: createTestState({
      users: {
        [owner.id]: {
          id: owner.id,
          name: owner.name,
        },
      },
      teams: {
        '1': createTestTeam({
          id: '1',
          ownerId: owner.id,
          users: [owner.id],
        }),
      },
    }),
  });

  assert({
    given: 'multiple addTeam actions with an existing owner',
    should: 'add all teams to the state with the owner assigned to each team',
    actual: ['1', '2', '3']
      .map((id) => addTeam({ id, ownerId: owner.id }))
      .reduce(reducer, reducer(undefined, addUser({ ...owner }))),
    expected: createTestState({
      users: {
        [owner.id]: owner,
      },
      teams: {
        '1': createTestTeam({ id: '1', ownerId: owner.id, users: [owner.id] }),
        '2': createTestTeam({ id: '2', ownerId: owner.id, users: [owner.id] }),
        '3': createTestTeam({ id: '3', ownerId: owner.id, users: [owner.id] }),
      },
    }),
  });

  assert({
    given: 'adding a new team with initial users, repeating the ownerId in the users array',
    should: 'only have the owner id appear once in team.users',
    actual: [
      addUser({ ...owner }),
      addTeam({ id: '1', ownerId: owner.id, users: [owner.id, '2'] }),
    ].reduce(reducer, reducer()),
    expected: createTestState({
      users: {
        [owner.id]: owner,
      },
      teams: {
        '1': createTestTeam({ id: '1', ownerId: owner.id, users: [owner.id, '2'] }),
      },
    }),
  });
});

describe('checkin: adding checkins', async (assert) => {
  const owner = createTestUser({ id: '1' });
  const team = createTestTeam({ id: '1', ownerId: owner.id, users: [owner.id] });
  const createBaseCheckinTestState = ({
    users = {
      [owner.id]: owner,
    },
    teams = {
      [team.id]: team,
    },
    checkins = [],
  } = {}) =>
    createTestState({
      users,
      teams,
      checkins,
    });
  const getInitialCheckinActions = () => [
    addUser({ id: owner.id }),
    addTeam({ id: team.id, ownerId: owner.id }),
  ];
  assert({
    given: 'adding a checkin for an existing user and team',
    should: 'should add the checkin to the state',
    actual: getInitialCheckinActions()
      .concat([
        addCheckin({ id: '0', userId: owner.id, teamId: team.id, createdAt: 1591044882455 }),
      ])
      .reduce(reducer, reducer()),
    expected: createBaseCheckinTestState({
      checkins: [
        createTestCheckin({ id: '0', userId: owner.id, teamId: team.id, createdAt: 1591044882455 }),
      ],
    }),
  });

  assert({
    given: 'adding a checkin for a nonexistent user',
    should: 'not modify state',
    actual: reducer(undefined, addCheckin({ id: '1', userId: owner.id })),
    expected: createTestState(),
  });

  assert({
    given: 'adding a checkin for an existing user and a nonexistent team',
    should: 'not modify state',
    actual: getInitialCheckinActions()
      .slice(0, 1)
      .concat([addCheckin({ id: '1', teamId: team.id, userId: owner.id })])
      .reduce(reducer, reducer()),
    expected: createTestState({
      users: { [owner.id]: owner },
    }),
  });
});
