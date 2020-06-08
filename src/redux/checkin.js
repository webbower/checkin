import produce from 'immer';

// TODO 01-06
// √ Use immer for complex state updates

/*
const createUser = ({ id = 0, name = 'John Doe' } = {}) => ({
  id,
  name,
});

const createTeam = ({ id = 0, name = 'Team 1', ownerId = 1, users: [] } = {}) => ({
  id,
  name,
  ownerId,
  users,
});

const createCheckin = ({
  id = 0,
  taskIds = [],
  blockerIds = [],
  teamId = 0,
  ownerId = 0,
  date = Date.now(),
} = {}) => ({
  id,
  taskIds,
  blockerIds,
  teamId,
  ownerId,
  date,
});

const createTask = ({
  id = '0',
  description = 'Do something',
  checkinId = '0',
  userId = '0',
  completed = false,
}) => ({
  id,
  description,
  checkinId,
  userId,
  completed,
});

const createBlocker = ({ id = '1', description = 'A wall', checkinId = 0, userId = '0' }) => ({
  id,
  description,
  checkinId,
  userId,
});
*/
export const addUser = ({ id = '0', name = 'Anonymous' } = {}) => ({
  type: 'checkin/ADD_USER',
  payload: {
    id,
    name,
  },
});

export const addTeam = ({ id = '0', name = `Team ${id}`, ownerId = '0', users = [] } = {}) => ({
  type: 'checkin/ADD_TEAM',
  payload: {
    id,
    name,
    ownerId,
    // Add the creating user to the team along with anyone else, but avoid duplicates
    users: [...new Set([ownerId, ...users])],
  },
});

export const addCheckin = ({
  id = '0',
  userId = '0',
  teamId = '0',
  createdAt = Date.now(),
  tasks = [],
  blockers = [],
} = {}) => ({
  type: 'checkin/ADD_CHECKIN',
  payload: {
    id,
    userId,
    teamId,
    createdAt,
    tasks,
    blockers,
  },
});

export const addTask = ({
  id = '0',
  description = 'Do something',
  checkinId = '0',
  userId = '0',
  completed = false,
} = {}) => ({
  type: 'checkin/ADD_TASK',
  payload: {
    id,
    description,
    checkinId,
    userId,
    completed,
  },
});

export const addBlocker = ({
  id = '0',
  description = 'A wall',
  checkinId = '0',
  userId = '0',
} = {}) => ({
  type: 'checkin/ADD_BLOCKER',
  payload: {
    id,
    description,
    checkinId,
    userId,
  },
});

// Selectors
export const getUsersList = (state) => Object.entries(state.users).map(([, user]) => user);

export const getTeamsList = (state) =>
  Object.entries(state.teams).map(([, team]) => ({
    id: team.id,
    name: team.name,
    users: team.users.map((id) => (state.users[id] || {}).name),
  }));

// Initial State
export const getInitialState = ({ users = {}, teams = {}, checkins = [] } = {}) => ({
  users,
  teams,
  checkins,
});

// Reducer
export default function reducer(state = getInitialState(), action = {}) {
  return produce(state, (draft) => {
    switch (action.type) {
      case addUser().type:
        draft.users[action.payload.id] = action.payload;
        return;
      case addTeam().type:
        // If the owner doesn't exist, don't modify the state
        // TODO Show error message
        if (!state.users[action.payload.ownerId]) {
          return;
        }

        draft.teams[action.payload.id] = action.payload;
        return;
      case addCheckin().type:
        // If the user or team doesn't exist, don't modify the state
        // TODO Show error message
        if (!state.users[action.payload.userId] || !state.teams[action.payload.teamId]) {
          return;
        }

        draft.checkins.push(action.payload);
        return;
      case addTask().type: {
        // If the user doesn't exist, don't modify the state
        // TODO Show error message
        if (!state.users[action.payload.userId]) {
          return;
        }

        const checkinIndex = state.checkins.findIndex((c) => c.id === action.payload.checkinId);

        // If the checkin doesn't exist, don't modify the state
        // TODO Show error message
        if (!state.checkins[checkinIndex]) {
          return;
        }

        draft.checkins[checkinIndex].tasks.push(action.payload);
        return;
      }
      case addBlocker().type: {
        // If the user doesn't exist, don't modify the state
        // TODO Show error message
        if (!state.users[action.payload.userId]) {
          return;
        }

        const checkinIndex = state.checkins.findIndex((c) => c.id === action.payload.checkinId);

        // If the checkin doesn't exist, don't modify the state
        // TODO Show error message
        if (!state.checkins[checkinIndex]) {
          return;
        }

        draft.checkins[checkinIndex].blockers.push(action.payload);
        return;
      }
    }
  });
}
