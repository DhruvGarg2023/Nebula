import getRedisClient from '../../core/redis/client.js';
import logger from '../../core/logger/index.js';

const PRESENCE_PREFIX = 'room_presence:';
const HEARTBEAT_TTL = 30; // 30 seconds

/**
 * Tracks a user's presence in a room using a Redis Set.
 * We store a JSON string of { userId, name, socketId, timestamp }.
 *
 * @param {string} roomId 
 * @param {Object} user 
 * @param {string} socketId 
 */
export async function trackPresence(roomId, user, socketId) {
  const key = `${PRESENCE_PREFIX}${roomId}`;
  
  // Clean up any stale entries for this user first
  await removePresenceByUserId(roomId, user.id);

  const presenceData = JSON.stringify({
    userId: user.id,
    name: user.name,
    socketId: socketId,
    timestamp: Date.now()
  });

  // Add to set and refresh TTL
  await getRedisClient().sadd(key, presenceData);
  await getRedisClient().expire(key, HEARTBEAT_TTL);
}

/**
 * Removes a specific presence entry based on socketId.
 * (Used on disconnect)
 * 
 * @param {string} roomId 
 * @param {string} socketId 
 */
export async function removePresence(roomId, socketId) {
  const key = `${PRESENCE_PREFIX}${roomId}`;
  const members = await getRedisClient().smembers(key);

  let removed = null;
  for (const memberStr of members) {
    try {
      const member = JSON.parse(memberStr);
      if (member.socketId === socketId) {
        await getRedisClient().srem(key, memberStr);
        removed = member;
      }
    } catch (err) {
      logger.error('Failed to parse presence member', err);
    }
  }

  return removed;
}

/**
 * Removes presence entries by userId (e.g. if connected from multiple tabs,
 * or cleaning up before adding new to avoid duplicates).
 */
export async function removePresenceByUserId(roomId, userId) {
  const key = `${PRESENCE_PREFIX}${roomId}`;
  const members = await getRedisClient().smembers(key);

  for (const memberStr of members) {
    try {
      const member = JSON.parse(memberStr);
      if (member.userId === userId) {
        await getRedisClient().srem(key, memberStr);
      }
    } catch (err) {
      logger.error('Failed to parse presence member', err);
    }
  }
}

/**
 * Extends the TTL of the room's presence key.
 * @param {string} roomId 
 */
export async function heartbeatPresence(roomId) {
  const key = `${PRESENCE_PREFIX}${roomId}`;
  await getRedisClient().expire(key, HEARTBEAT_TTL);
}

/**
 * Retrieves all currently online users for a room.
 * @param {string} roomId 
 * @returns {Array} Array of user presence objects
 */
export async function getRoomPresence(roomId) {
  const key = `${PRESENCE_PREFIX}${roomId}`;
  const members = await getRedisClient().smembers(key);

  const presenceList = [];
  const now = Date.now();

  for (const memberStr of members) {
    try {
      const member = JSON.parse(memberStr);
      // We don't filter by time here, Redis TTL cleans up the entire room key.
      // In a real scenario, we might use Sorted Sets with timestamps to evict individuals.
      // For Milestone 4, a Set with room-level TTL or simple array cleanup is fine.
      presenceList.push(member);
    } catch (err) {
      logger.error('Failed to parse presence member', err);
    }
  }

  return presenceList;
}
