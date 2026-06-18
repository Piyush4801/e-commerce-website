const activeSessions = new Map(); // Map<userId, timestamp>
const MAX_CONCURRENT_USERS = 5;
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

const cleanExpiredSessions = () => {
  const now = Date.now();
  for (const [userId, timestamp] of activeSessions.entries()) {
    if (now - timestamp > SESSION_TIMEOUT_MS) {
      activeSessions.delete(userId);
    }
  }
};

const canLogin = (userId) => {
  cleanExpiredSessions();
  
  // If the user is already active, they can login again (e.g. from another device)
  // Or they might be requesting a new session token.
  if (userId && activeSessions.has(userId.toString())) {
    return true;
  }
  
  // Otherwise, check if we have reached the maximum capacity
  return activeSessions.size < MAX_CONCURRENT_USERS;
};

const touchSession = (userId) => {
  if (userId) {
    activeSessions.set(userId.toString(), Date.now());
  }
};

const removeSession = (userId) => {
  if (userId) {
    activeSessions.delete(userId.toString());
  }
};

module.exports = {
  canLogin,
  touchSession,
  removeSession,
  getActiveUserCount: () => {
    cleanExpiredSessions();
    return activeSessions.size;
  }
};
