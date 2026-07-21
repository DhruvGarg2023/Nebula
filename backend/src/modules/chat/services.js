import * as chatRepo from './repositories.js';

/**
 * Sanitizes input string to prevent HTML/XSS injection in chat.
 */
function sanitizeContent(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Creates and persists a user or system chat message.
 */
export async function createMessage({ roomId, userId, content, type = 'USER' }) {
  const sanitizedContent = sanitizeContent(content.trim());
  return chatRepo.createMessage({
    roomId,
    userId: type === 'SYSTEM' ? null : userId,
    content: sanitizedContent,
    type,
  });
}

/**
 * Retrieves paginated room messages.
 */
export async function getRoomMessages(roomId, limit, cursor) {
  return chatRepo.getRoomMessages(roomId, limit, cursor);
}
