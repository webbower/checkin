import { describe } from 'riteway';
import {
  default as reducer,
  addUser,
  addTeam,
  addCheckin,
  addTask,
  addBlocker,
  nextCheckinStep,
  getUsersList,
  getTeamsList,
  getTeamCheckinSummary,
  getMostRecentCheckinForUser,
  getCurrentUserId,
  getCreateCheckinStep,
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

const createTestState = ({
  users = {},
  teams = {},
  checkins = [],
  currentUserId = '1',
  createCheckinStep = 0,
} = {}) => ({
  users,
  teams,
  checkins,
  auth: { currentUserId },
  ui: { createCheckinStep },
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

const reduceActions = (actions = []) => actions.reduce(reducer, reducer());

describe('checkin: reducer()', async assert => {
  assert({
    given: 'no arguments',
    should: 'return initial state',
    actual: reducer(),
    expected: createTestState(),
  });
});

describe('Redux action: addUser()', async assert => {
  assert({
    given: 'an addUser action',
    should: 'add the new user to the state',
    actual: reduceActions([addUser({ id: '1' })]),
    expected: createTestState({
      users: {
        '1': createTestUser({ id: '1' }),
      },
    }),
  });

  assert({
    given: 'multiple addUser actions',
    should: 'add all users to the state',
    actual: reduceActions([addUser({ id: '1' }), addUser({ id: '2' }), addUser({ id: '3' })]),
    expected: createTestState({
      users: {
        '1': createTestUser({ id: '1' }),
        '2': createTestUser({ id: '2' }),
        '3': createTestUser({ id: '3' }),
      },
    }),
  });
});

describe('Redux action: addTeam()', async assert => {
  const owner = createTestUser({ id: '1' });

  // TODO Should addTeams() add the team if users[ownerId] doesn't exist?
  assert({
    given: 'an addTeam action when the owner does not exist',
    should: 'not modify the state',
    actual: reduceActions([addTeam({ id: '1', ownerId: owner.id })]),
    expected: createTestState(),
  });

  assert({
    given: 'an addTeam action with an existing owner',
    should: 'add the team and add the user who created the team to the new team',
    actual: reduceActions([addUser({ ...owner }), addTeam({ id: '1', ownerId: owner.id })]),
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
    actual: reduceActions([
      addUser({ ...owner }),
      addTeam({ id: '1', ownerId: owner.id }),
      addTeam({ id: '2', ownerId: owner.id }),
      addTeam({ id: '3', ownerId: owner.id }),
    ]),
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
    actual: reduceActions([
      addUser({ ...owner }),
      addTeam({ id: '1', ownerId: owner.id, users: [owner.id, '2'] }),
    ]),
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

describe('Redux action: addCheckin()', async assert => {
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
    actual: reduceActions([
      ...getInitialCheckinActions(),
      addCheckin({
        id: checkinId,
        userId: owner.id,
        teamId: team.id,
        createdAt: checkinCreatedAtTimestamp,
      }),
    ]),
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
    actual: reduceActions([addCheckin({ id: '1', userId: owner.id })]),
    expected: createTestState(),
  });

  assert({
    given: 'adding a checkin for an existing user and a nonexistent team',
    should: 'not modify state',
    actual: reduceActions([
      ...getInitialCheckinActions().slice(0, 1),
      addCheckin({ id: '1', teamId: team.id, userId: owner.id }),
    ]),
    expected: createTestState({
      users: { [owner.id]: owner },
    }),
  });
});

describe('Redux action: addTask()', async assert => {
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
    actual: reduceActions([
      ...getInitialTaskActions(),
      addTask({ description: 'Build Checkin App', checkinId: checkin.id, userId: owner.id }),
    ]),
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
    actual: reduceActions([
      ...getInitialTaskActions(),
      addTask({ description: 'Build Checkin App', checkinId: checkin.id, userId: '1000' }),
    ]),
    expected: createBaseTasksTestState(),
  });

  assert({
    given: 'adding a task to a non-existent checkin',
    should: 'should not modify state',
    actual: reduceActions([
      ...getInitialTaskActions(),
      addTask({ description: 'Build Checkin App', checkinId: '1000', userId: owner.id }),
    ]),
    expected: createBaseTasksTestState(),
  });

  assert({
    given: 'adding multiple tasks to existing checkins by existing users',
    should: 'add the tasks to the state',
    actual: reduceActions([
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
    ]),
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

describe('Redux action: addBlocker()', async assert => {
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

  {
    const actual = reduceActions([
      ...getInitialBlockerActions(),
      addBlocker({ description: 'Life gets in the way', checkinId: checkin.id, userId: owner.id }),
    ]);
    const expected = createBaseBlockersTestState({
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
    });

    assert({
      given: 'adding a blocker to an existing checkin by an existing user',
      should: 'ad the blocker to the state',
      actual,
      expected,
    });
  }

  assert({
    given: 'adding a blocker for a non-existent user',
    should: 'should not modify state',
    actual: reduceActions([
      ...getInitialBlockerActions(),
      addBlocker({ description: 'Life gets in the way', checkinId: checkin.id, userId: user2Id }),
    ]),
    expected: createBaseBlockersTestState(),
  });

  assert({
    given: 'adding a task to a non-existent checkin',
    should: 'should not modify state',
    actual: reduceActions([
      ...getInitialBlockerActions(),
      addBlocker({ description: 'Life gets in the way', checkinId: checkin2Id, userId: owner.id }),
    ]),
    expected: createBaseBlockersTestState(),
  });

  {
    const actual = reduceActions([
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
    ]);
    const expected = createBaseBlockersTestState({
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
    });

    assert({
      given: 'adding multiple tasks to existing checkins by existing users',
      should: 'add the tasks to the state',
      actual,
      expected,
    });
  }
});

describe('Redux action: nextCheckinStep()', async assert => {
  assert({
    given: 'default checkin state',
    should: 'increment checkin step state',
    actual: reduceActions([nextCheckinStep()]),
    expected: createTestState({ createCheckinStep: 1 }),
  });
});

describe('Redux selector: getUsersList()', async assert => {
  assert({
    given: 'no users in state',
    should: 'return an empty array',
    actual: getUsersList(createTestState()),
    expected: [],
  });

  assert({
    given: 'users in state',
    should: 'return an array of users',
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

describe('Redux selector: getTeamsList()', async assert => {
  assert({
    given: 'no teams in state',
    should: 'return an empty array',
    actual: getTeamsList(createTestState()),
    expected: [],
  });

  {
    const actual = getTeamsList(
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
    );
    const expected = [{ id: '12345', name: 'The First Team', users: ['Jane', 'Bob'] }];

    assert({
      given: 'teams in state',
      should: 'return an array of teams',
      actual,
      expected,
    });
  }
});

describe('Redux selector: getTeamCheckinSummary()', async assert => {
  const teamId = '1';
  const teamName = 'The First Team';
  const checkinCreatedAtTimestamp = 1591044882455;
  const team = createTestTeam({
    id: teamId,
    name: teamName,
  });

  assert({
    given: 'no team with a matching ID in state',
    should: 'return an empty object',
    actual: getTeamCheckinSummary('54321')(createTestState()),
    expected: {},
  });

  assert({
    given: 'a team with matching ID in state but no checkins',
    should: 'return the team data with checkins as empty array',
    actual: getTeamCheckinSummary(teamId)(createTestState({ teams: { [teamId]: team } })),
    expected: {
      id: teamId,
      name: teamName,
      checkins: [],
    },
  });

  {
    const actual = getTeamCheckinSummary(teamId)(
      createTestState({
        users: {
          '1': createTestUser({ id: '1', name: 'Bob' }),
          '2': createTestUser({ id: '2', name: 'Jane' }),
        },
        teams: {
          [teamId]: createTestTeam({
            id: teamId,
            name: teamName,
            ownerId: '2',
            users: ['2', '1'],
          }),
        },
        checkins: [
          createTestCheckin({
            id: '1',
            userId: '1',
            teamId,
            createdAt: checkinCreatedAtTimestamp,
            tasks: [],
            blockers: [],
          }),
          createTestCheckin({
            id: '2',
            userId: '2',
            teamId,
            createdAt: checkinCreatedAtTimestamp + 1000,
            tasks: [],
            blockers: [],
          }),
        ],
      })
    );
    const expected = {
      id: teamId,
      name: teamName,
      checkins: [
        {
          id: '1',
          user: 'Bob',
          createdAt: checkinCreatedAtTimestamp,
          tasks: [],
          blockers: [],
        },
        {
          id: '2',
          user: 'Jane',
          createdAt: checkinCreatedAtTimestamp + 1000,
          tasks: [],
          blockers: [],
        },
      ],
    };

    assert({
      given: 'a matching team in state with checkins',
      should: 'return the team data with checkins in chronological order',
      actual,
      expected,
    });
  }
});

describe('checkin selectors: getMostRecentCheckinForUser()', async assert => {
  const userId = '1';
  const userName = 'Jane';
  const user = createTestUser({
    id: userId,
    name: userName,
  });
  const user2Id = '2';
  const user2Name = 'Bob';
  const teamId = '1';
  const teamName = 'The First Team';

  const checkinCreatedAtTimestamp = 1591044882455;

  {
    const actual = getMostRecentCheckinForUser(
      userId,
      createTestState({
        users: {
          [user.id]: createTestUser({ ...user }),
          [user2Id]: createTestUser({ id: user2Id, name: user2Name }),
        },
        teams: {
          [teamId]: createTestTeam({
            id: teamId,
            name: teamName,
            ownerId: user2Id,
            users: [user2Id, user.id],
          }),
        },
        checkins: [
          createTestCheckin({
            id: '1',
            userId: user.id,
            teamId,
            createdAt: checkinCreatedAtTimestamp,
            tasks: [
              createTestTask({
                id: '1',
                description: 'Foo',
                completed: false,
              }),
            ],
            blockers: [
              createTestBlocker({
                id: '1',
                description: 'Blarg!',
              }),
            ],
          }),
          createTestCheckin({
            id: '2',
            userId: user2Id,
            teamId,
            createdAt: checkinCreatedAtTimestamp + 1000,
            tasks: [],
            blockers: [],
          }),
          createTestCheckin({
            id: '3',
            userId: user.id,
            teamId,
            createdAt: checkinCreatedAtTimestamp - 1000,
            tasks: [],
            blockers: [],
          }),
        ],
      })
    );
    const expected = {
      id: '1',
      user: user.name,
      createdAt: checkinCreatedAtTimestamp,
      tasks: [
        {
          id: '1',
          description: 'Foo',
          completed: false,
        },
      ],
      blockers: [{ id: '1', description: 'Blarg!' }],
    };

    assert({
      given: 'checkins and user in state',
      should: 'return the most recent checkin for a user',
      actual,
      expected,
    });
  }

  assert({
    given: 'no checkins in state for a user',
    should: 'return null',
    actual: getMostRecentCheckinForUser(
      userId,
      createTestState({
        users: {
          [user.id]: createTestUser({ ...user }),
          [user2Id]: createTestUser({ id: user2Id, name: user2Name }),
        },
      })
    ),
    expected: null,
  });
});

describe('Redux selector: getCurrentUserId()', async assert => {
  assert({
    given: 'a logged in user in state',
    should: 'get the logged in user ID',
    actual: getCurrentUserId(createTestState()),
    expected: '1',
  });
});

describe('Redux selector: getCreateCheckinStep()', async assert => {
  assert({
    given: 'default create checkin state',
    should: 'return step 0',
    actual: getCreateCheckinStep(createTestState()),
    expected: 0,
  });

  assert({
    given: 'completing 2 steps in the create checkin flow',
    should: 'return step 2',
    actual: getCreateCheckinStep(reduceActions([nextCheckinStep(), nextCheckinStep()])),
    expected: 2,
  });
});
