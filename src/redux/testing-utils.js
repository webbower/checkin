const createTestUser = ({ id = '0', name = 'Anonymous' } = {}) => ({ id, name });

const createTestTeam = ({ id = '0', name = `Team ${id}`, ownerId = '0', users = [] } = {}) => ({
  id,
  name,
  ownerId,
  users,
});

export { createTestUser, createTestTeam };
