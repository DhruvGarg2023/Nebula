import * as Y from 'yjs';
import * as fileRepo from '../file/repositories.js';
import logger from '../../core/logger/index.js';

// Memory cache of active documents
// In a multi-node setup, this would be backed by Redis using y-redis or similar.
// For Milestone 5, we'll keep it in memory and rely on Socket.IO sticky sessions 
// or single-node deployment.
const activeDocuments = new Map(); // fileId -> { doc: Y.Doc, timeout: NodeJS.Timeout }
const DEBOUNCE_MS = 5000;

/**
 * Gets or initializes a Yjs document for a file
 */
export async function getDocument(roomId, fileId) {
  if (activeDocuments.has(fileId)) {
    return activeDocuments.get(fileId).doc;
  }

  // Load from DB if not in memory
  const file = await fileRepo.getFileById(fileId, roomId);
  if (!file) {
    throw new Error('File not found');
  }

  const doc = new Y.Doc();
  if (file.content) {
    doc.getText('content').insert(0, file.content);
  }

  activeDocuments.set(fileId, { doc, timeout: null });
  return doc;
}

/**
 * Applies a Yjs update to the document and schedules a save
 */
export async function applyUpdate(roomId, fileId, updateBase64) {
  const doc = await getDocument(roomId, fileId);
  
  // Convert base64 back to Uint8Array
  const update = Buffer.from(updateBase64, 'base64');
  
  Y.applyUpdate(doc, update);

  // Debounce save to database
  const state = activeDocuments.get(fileId);
  if (state.timeout) {
    clearTimeout(state.timeout);
  }

  state.timeout = setTimeout(() => {
    saveToDatabase(roomId, fileId);
  }, DEBOUNCE_MS);
}

/**
 * Saves the current Yjs document state to the PostgreSQL database
 */
async function saveToDatabase(roomId, fileId) {
  try {
    const state = activeDocuments.get(fileId);
    if (!state) return;

    const content = state.doc.getText('content').toString();
    await fileRepo.updateFile(fileId, roomId, { content });
    
    // Clean up memory after saving to prevent memory leaks for inactive files
    activeDocuments.delete(fileId);
    logger.info({ fileId }, 'Saved document state to database and cleared memory');
  } catch (err) {
    logger.error({ err, fileId }, 'Failed to save document to database');
  }
}

/**
 * Encodes the entire document state as a base64 string for initial sync
 */
export async function getDocumentState(roomId, fileId) {
  const doc = await getDocument(roomId, fileId);
  const update = Y.encodeStateAsUpdate(doc);
  return Buffer.from(update).toString('base64');
}
