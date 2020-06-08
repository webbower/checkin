import { describe } from 'riteway';
import {
  default as reducer,
  addUser,
  addTeam,
  addCheckin,
  addTask,
  addBlocker,
  getUsersList,
  getTeamsList,
} from './checkin.js';
import { createTestUser, createTestTeam } from './testing-utils.js';

// TODO 26-05
// √ Replace `expected: getInitialState()` with test-only `createTestState()` factory
// √ Replace actionCreator().payload references in `expected` keys with test shape creators
// √ Principle of Least Knowledge!! (Need to know basis)
// √ Don't refactor out state slices. State is not complex enough.
// - Action creators can conditionally dispatch one of multiple possible actions

// TODO 01-06
// √ Remove logic from `createTestState()` regarding zipping checkins and tasks
// √ Use variables instead of repeated literal data in tests

const createTestState = ({ users = {}, teams = {}, checkins = [] } = {}) => ({
  users,
  teams,
  checkins,
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

const createTestTask = ({
  id = '0',
  description = 'Do something',
  checkinId = '0',
  userId = '0',
  completed = false,
} = {}) => ({
  id,
  description,
  checkinId,
  userId,
  completed,
});

const createTestBlocker = ({
  id = '0',
  description = 'A wall',
  checkinId = '0',
  userId = '0',
} = {}) => ({
  id,
  description,
  checkinId,
  userId,
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
  const checkinId = '1';
  const checkinCreatedAtTimestamp = 1591044882455;
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
        addCheckin({
          id: checkinId,
          userId: owner.id,
          teamId: team.id,
          createdAt: checkinCreatedAtTimestamp,
        }),
      ])
      .reduce(reducer, reducer()),
    expected: createBaseCheckinTestState({
      checkins: [
        createTestCheckin({
          id: checkinId,
          userId: owner.id,
          teamId: team.id,
          createdAt: checkinCreatedAtTimestamp,
        }),
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

describe('checkin: adding tasks', async (assert) => {
  const owner = createTestUser({ id: '1' });
  const team = createTestTeam({ id: '1', ownerId: owner.id, users: [owner.id] });
  const checkin = createTestCheckin({
    id: '0',
    userId: owner.id,
    teamId: team.id,
    createdAt: 1591044882455,
  });
  const user2Id = '2';
  const team2Id = '2';
  const checkin2Id = '2';
  const checkin2CreatedAtTimestamp = 1591044882456;
  const createBaseTasksTestState = ({
    users = {
      [owner.id]: owner,
    },
    teams = {
      [team.id]: team,
    },
    checkins = [checkin],
  } = {}) =>
    createTestState({
      users,
      teams,
      checkins,
    });
  const getInitialTaskActions = () => [
    addUser({ id: owner.id }),
    addTeam({ id: team.id, ownerId: owner.id }),
    addCheckin({ id: checkin.id, userId: owner.id, teamId: team.id, createdAt: checkin.createdAt }),
  ];

  assert({
    given: 'adding a task to an existing checkin by an existing user',
    should: 'add the task to the state',
    actual: [
      ...getInitialTaskActions(),
      addTask({ description: 'Build Checkin App', checkinId: checkin.id, userId: owner.id }),
    ].reduce(reducer, reducer()),
    expected: createBaseTasksTestState({
      checkins: [
        createTestCheckin({
          ...checkin,
          tasks: [
            createTestTask({
              description: 'Build Checkin App',
              checkinId: checkin.id,
              userId: owner.id,
            }),
          ],
        }),
      ],
    }),
  });

  assert({
    given: 'adding a task for a non-existent user',
    should: 'should not modify state',
    actual: [
      ...getInitialTaskActions(),
      addTask({ description: 'Build Checkin App', checkinId: checkin.id, userId: '1000' }),
    ].reduce(reducer, reducer()),
    expected: createBaseTasksTestState(),
  });

  assert({
    given: 'adding a task to a non-existent checkin',
    should: 'should not modify state',
    actual: [
      ...getInitialTaskActions(),
      addTask({ description: 'Build Checkin App', checkinId: '1000', userId: owner.id }),
    ].reduce(reducer, reducer()),
    expected: createBaseTasksTestState(),
  });

  assert({
    given: 'adding multiple tasks to existing checkins by existing users',
    should: 'add the tasks to the state',
    actual: [
      ...getInitialTaskActions(),
      addUser({ id: user2Id }),
      addTeam({ id: team2Id, ownerId: user2Id }),
      addTask({ description: 'Build Checkin App', checkinId: checkin.id, userId: owner.id }),
      addCheckin({
        id: checkin2Id,
        userId: user2Id,
        teamId: team2Id,
        createdAt: checkin2CreatedAtTimestamp,
      }),
      addTask({ description: 'Push code to GitHub', checkinId: checkin2Id, userId: user2Id }),
      addTask({ description: 'Review GitHub PRs', checkinId: checkin2Id, userId: owner.id }),
    ].reduce(reducer, reducer()),
    expected: createBaseTasksTestState({
      users: {
        [owner.id]: owner,
        [user2Id]: createTestUser({ id: user2Id }),
      },
      teams: {
        [team.id]: team,
        [team2Id]: createTestTeam({ id: team2Id, ownerId: user2Id, users: [user2Id] }),
      },
      checkins: [
        createTestCheckin({
          ...checkin,
          tasks: [
            createTestTask({
              description: 'Build Checkin App',
              checkinId: checkin.id,
              userId: owner.id,
            }),
          ],
        }),
        createTestCheckin({
          id: checkin2Id,
          userId: user2Id,
          teamId: team2Id,
          createdAt: checkin2CreatedAtTimestamp,
          tasks: [
            createTestTask({
              description: 'Push code to GitHub',
              checkinId: checkin2Id,
              userId: user2Id,
            }),
            createTestTask({
              description: 'Review GitHub PRs',
              checkinId: checkin2Id,
              userId: owner.id,
            }),
          ],
        }),
      ],
    }),
  });
});

describe('checkin: adding blockers', async (assert) => {
  const owner = createTestUser({ id: '1' });
  const team = createTestTeam({ id: '1', ownerId: owner.id, users: [owner.id] });
  const checkin = createTestCheckin({
    id: '1',
    userId: owner.id,
    teamId: team.id,
    createdAt: 1591044882455,
  });
  const user2Id = '2';
  const team2Id = '2';
  const checkin2Id = '2';
  const checkin2CreatedAtTimestamp = 1591044882456;
  const createBaseBlockersTestState = ({
    users = {
      [owner.id]: owner,
    },
    teams = {
      [team.id]: team,
    },
    checkins = [checkin],
  } = {}) =>
    createTestState({
      users,
      teams,
      checkins,
    });
  const getInitialBlockerActions = () => [
    addUser({ id: owner.id }),
    addTeam({ id: team.id, ownerId: owner.id }),
    addCheckin({ id: checkin.id, userId: owner.id, teamId: team.id, createdAt: checkin.createdAt }),
  ];

  assert({
    given: 'adding a blocker to an existing checkin by an existing user',
    should: 'ad the blocker to the state',
    actual: [
      ...getInitialBlockerActions(),
      addBlocker({ description: 'Life gets in the way', checkinId: checkin.id, userId: owner.id }),
    ].reduce(reducer, reducer()),
    expected: createBaseBlockersTestState({
      checkins: [
        createTestCheckin({
          ...checkin,
          blockers: [
            createTestBlocker({
              description: 'Life gets in the way',
              checkinId: checkin.id,
              userId: owner.id,
            }),
          ],
        }),
      ],
    }),
  });

  assert({
    given: 'adding a blocker for a non-existent user',
    should: 'should not modify state',
    actual: [
      ...getInitialBlockerActions(),
      addBlocker({ description: 'Life gets in the way', checkinId: checkin.id, userId: user2Id }),
    ].reduce(reducer, reducer()),
    expected: createBaseBlockersTestState(),
  });

  assert({
    given: 'adding a task to a non-existent checkin',
    should: 'should not modify state',
    actual: [
      ...getInitialBlockerActions(),
      addBlocker({ description: 'Life gets in the way', checkinId: checkin2Id, userId: owner.id }),
    ].reduce(reducer, reducer()),
    expected: createBaseBlockersTestState(),
  });

  assert({
    given: 'adding multiple tasks to existing checkins by existing users',
    should: 'add the tasks to the state',
    actual: [
      ...getInitialBlockerActions(),
      addUser({ id: user2Id }),
      addTeam({ id: team2Id, ownerId: user2Id }),
      addBlocker({ description: 'Life gets in the way', checkinId: checkin.id, userId: owner.id }),
      addCheckin({
        id: checkin2Id,
        userId: user2Id,
        teamId: team2Id,
        createdAt: checkin2CreatedAtTimestamp,
      }),
      addBlocker({ description: 'My dog ate my code', checkinId: checkin2Id, userId: user2Id }),
      addBlocker({ description: 'My computer died', checkinId: checkin2Id, userId: owner.id }),
    ].reduce(reducer, reducer()),
    expected: createBaseBlockersTestState({
      users: {
        [owner.id]: owner,
        [user2Id]: createTestUser({ id: user2Id }),
      },
      teams: {
        [team.id]: team,
        [team2Id]: createTestTeam({ id: team2Id, ownerId: user2Id, users: [user2Id] }),
      },
      checkins: [
        createTestCheckin({
          ...checkin,
          blockers: [
            createTestBlocker({
              description: 'Life gets in the way',
              checkinId: checkin.id,
              userId: owner.id,
            }),
          ],
        }),
        createTestCheckin({
          id: checkin2Id,
          userId: user2Id,
          teamId: team2Id,
          createdAt: checkin2CreatedAtTimestamp,
          blockers: [
            createTestBlocker({
              description: 'My dog ate my code',
              checkinId: checkin2Id,
              userId: user2Id,
            }),
            createTestBlocker({
              description: 'My computer died',
              checkinId: checkin2Id,
              userId: owner.id,
            }),
          ],
        }),
      ],
    }),
  });
});

describe('checkin selectors: getUsersList', async (assert) => {
  assert({
    given: 'no users in state',
    should: 'return an empty array',
    actual: getUsersList(createTestState()),
    expected: [],
  });

  assert({
    given: 'users in state',
    should: 'return an array or users',
    actual: getUsersList(
      createTestState({
        users: {
          '1': createTestUser({ id: '1', name: 'Bob' }),
        },
      })
    ),
    expected: [{ id: '1', name: 'Bob' }],
  });
});

describe('checkin selectors: getTeamsList', async (assert) => {
  assert({
    given: 'no teams in state',
    should: 'return an empty array',
    actual: getTeamsList(createTestState()),
    expected: [],
  });

  assert({
    given: 'teams in state',
    should: 'return an array or teams',
    actual: getTeamsList(
      createTestState({
        users: {
          '1': createTestUser({ id: '1', name: 'Bob' }),
          '2': createTestUser({ id: '2', name: 'Jane' }),
        },
        teams: {
          '12345': createTestTeam({
            id: '12345',
            name: 'The First Team',
            ownerId: '2',
            users: ['2', '1'],
          }),
        },
      })
    ),
    expected: [{ id: '12345', name: 'The First Team', users: ['Jane', 'Bob'] }],
  });
});
