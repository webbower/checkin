/*
const createUser = ({ id = 0, name = 'John Doe' } = {}) => ({
  id,
  name,
});
*/
export const addUser = ({ id = '0', name = 'Anonymous' } = {}) => ({
  type: 'checkin/ADD_USER',
  payload: {
    id,
    name,
  },
});

// Initial State
export const getInitialState = ({ users = {} } = {}) => ({
  users,
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
    default:
      return state;
  }
}
