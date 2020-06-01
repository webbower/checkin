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
*/
export const addUser = ({ id = '0', name = 'Anonymous' } = {}) => ({
  type: 'checkin/ADD_USER',
  payload: {
    id,
    name,
  },
});

export const addTeam = ({ id = '0', name = 'Team 1', ownerId = '0', users = [] } = {}) => ({
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

// Initial State
export const getInitialState = ({ users = {}, teams = {}, checkins = [] } = {}) => ({
  users,
  teams,
  checkins,
});

// Reducer
export default function reducer(state = getInitialState(), action = {}) {
  switch (action.type) {
    case addUser().type:
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.id]: action.payload,
        },
      };
    case addTeam().type:
      // If the owner doesn't exist, don't modify the state
      // TODO Show error message
      if (!state.users[action.payload.ownerId]) {
        return state;
      }

      return {
        ...state,
        teams: {
          ...state.teams,
          [action.payload.id]: action.payload,
        },
      };
    case addCheckin().type:
      // If the user or team doesn't exist, don't modify the state
      // TODO Show error message
      if (!state.users[action.payload.userId] || !state.teams[action.payload.teamId]) {
        return state;
      }

      return {
        ...state,
        checkins: [...state.checkins, action.payload],
      };
    default:
      return state;
  }
}
