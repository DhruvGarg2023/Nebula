import * as versionRepository from './repositories.js';
import { NotFoundError, ConflictError } from '../../core/errors/AppError.js';
import { getRedisClient } from '../../core/redis/client.js';
import logger from '../../core/logger/index.js';

/**
 * Version History Service business logic.
 */

export async function createSnapshot(roomId, userId, label, description) {
  // Fetch active room files
  const roomFiles = await versionRepository.getRoomFiles(roomId);

  const snapshot = await versionRepository.createSnapshot(
    roomId,
    userId,
    label,
    description,
    roomFiles
  );

  logger.info({ roomId, userId, versionId: snapshot.id }, 'Version snapshot created successfully');
  return snapshot;
}

export async function listVersions(roomId, page = 1, limit = 20) {
  return versionRepository.getVersionsByRoom(roomId, page, limit);
}

export async function getVersionDetails(roomId, versionId) {
  const version = await versionRepository.getVersionById(versionId, roomId);

  if (!version) {
    throw new NotFoundError('Version snapshot');
  }

  return version;
}

/**
 * Compute line-by-line file diff between base version and target version (or current room files).
 */
export async function computeVersionDiff(roomId, baseVersionId, targetVersionId = null) {
  const baseVersion = await getVersionDetails(roomId, baseVersionId);

  let targetFiles = [];
  let targetLabel = 'Current State';

  if (targetVersionId) {
    const targetVersion = await getVersionDetails(roomId, targetVersionId);
    targetFiles = targetVersion.versionFiles.map((vf) => ({
      name: vf.fileName,
      content: vf.content,
      language: vf.language,
    }));
    targetLabel = targetVersion.label || `Version ${targetVersion.id}`;
  } else {
    // Diff against active room files
    const activeFiles = await versionRepository.getRoomFiles(roomId);
    targetFiles = activeFiles.map((f) => ({
      name: f.name,
      content: f.content,
      language: f.language,
    }));
  }

  const baseFiles = baseVersion.versionFiles.map((vf) => ({
    name: vf.fileName,
    content: vf.content,
    language: vf.language,
  }));

  const fileMap = new Map();

  for (const f of baseFiles) {
    fileMap.set(f.name, { base: f, target: null });
  }

  for (const f of targetFiles) {
    if (fileMap.has(f.name)) {
      fileMap.get(f.name).target = f;
    } else {
      fileMap.set(f.name, { base: null, target: f });
    }
  }

  const fileDiffs = [];
  let filesAdded = 0;
  let filesDeleted = 0;
  let filesModified = 0;
  let filesUnchanged = 0;

  for (const [fileName, { base, target }] of fileMap.entries()) {
    if (!base && target) {
      filesAdded++;
      fileDiffs.push({
        fileName,
        status: 'added',
        baseContent: null,
        targetContent: target.content,
        lines: target.content ? target.content.split(/\r?\n/).map((line, idx) => ({ type: 'added', line, lineNumber: idx + 1 })) : [],
      });
    } else if (base && !target) {
      filesDeleted++;
      fileDiffs.push({
        fileName,
        status: 'deleted',
        baseContent: base.content,
        targetContent: null,
        lines: base.content ? base.content.split(/\r?\n/).map((line, idx) => ({ type: 'removed', line, lineNumber: idx + 1 })) : [],
      });
    } else if (base && target) {
      if (base.content === target.content) {
        filesUnchanged++;
        fileDiffs.push({
          fileName,
          status: 'unchanged',
          baseContent: base.content,
          targetContent: target.content,
          lines: [],
        });
      } else {
        filesModified++;
        const lineChanges = computeSimpleLineDiff(base.content, target.content);
        fileDiffs.push({
          fileName,
          status: 'modified',
          baseContent: base.content,
          targetContent: target.content,
          lines: lineChanges,
        });
      }
    }
  }

  return {
    baseVersion: {
      id: baseVersion.id,
      label: baseVersion.label,
      createdAt: baseVersion.createdAt,
    },
    targetVersion: targetVersionId ? { id: targetVersionId, label: targetLabel } : { id: null, label: targetLabel },
    summary: {
      totalFiles: fileDiffs.length,
      filesAdded,
      filesDeleted,
      filesModified,
      filesUnchanged,
    },
    files: fileDiffs,
  };
}

/**
 * Line-by-line text comparison helper.
 */
function computeSimpleLineDiff(baseText, targetText) {
  const baseLines = baseText ? baseText.split(/\r?\n/) : [];
  const targetLines = targetText ? targetText.split(/\r?\n/) : [];
  const changes = [];

  let i = 0;
  let j = 0;

  while (i < baseLines.length || j < targetLines.length) {
    if (i < baseLines.length && j < targetLines.length) {
      if (baseLines[i] === targetLines[j]) {
        changes.push({ type: 'unchanged', line: baseLines[i], baseLine: i + 1, targetLine: j + 1 });
        i++;
        j++;
      } else {
        // Look ahead for matching lines
        let foundInTarget = -1;
        for (let k = j + 1; k < Math.min(j + 5, targetLines.length); k++) {
          if (baseLines[i] === targetLines[k]) {
            foundInTarget = k;
            break;
          }
        }

        if (foundInTarget !== -1) {
          while (j < foundInTarget) {
            changes.push({ type: 'added', line: targetLines[j], targetLine: j + 1 });
            j++;
          }
        } else {
          changes.push({ type: 'removed', line: baseLines[i], baseLine: i + 1 });
          i++;
        }
      }
    } else if (i < baseLines.length) {
      changes.push({ type: 'removed', line: baseLines[i], baseLine: i + 1 });
      i++;
    } else if (j < targetLines.length) {
      changes.push({ type: 'added', line: targetLines[j], targetLine: j + 1 });
      j++;
    }
  }

  return changes;
}

/**
 * Restore room files to a version snapshot.
 * Uses a Redis distributed lock (`lock:version:restore:<roomId>`).
 */
export async function restoreVersion(roomId, userId, versionId) {
  const lockKey = `lock:version:restore:${roomId}`;
  const lockVal = `${userId}:${Date.now()}`;
  let lockAcquired = false;

  try {
    const redis = getRedisClient();
    const result = await redis.set(lockKey, lockVal, 'PX', 10000, 'NX');
    if (!result) {
      throw new ConflictError('Version restoration is already in progress for this room');
    }
    lockAcquired = true;

    // Verify version exists and belongs to room
    const version = await versionRepository.getVersionById(versionId, roomId);
    if (!version) {
      throw new NotFoundError('Version snapshot');
    }

    // Execute atomic DB restoration
    const restoredFiles = await versionRepository.restoreRoomFiles(roomId, version.versionFiles);

    logger.info({ roomId, userId, versionId, fileCount: restoredFiles.length }, 'Room files restored to version snapshot');

    return {
      version: {
        id: version.id,
        label: version.label,
        createdAt: version.createdAt,
      },
      restoredFiles,
    };
  } finally {
    if (lockAcquired) {
      try {
        const redis = getRedisClient();
        const currentLock = await redis.get(lockKey);
        if (currentLock === lockVal) {
          await redis.del(lockKey);
        }
      } catch (err) {
        logger.error({ err, lockKey }, 'Failed to release version restore lock');
      }
    }
  }
}
