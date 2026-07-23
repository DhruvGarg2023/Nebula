import * as versionService from './services.js';
import CONSTANTS from '../../config/constants.js';

/**
 * Controller handlers for Version History endpoints.
 */

export async function createSnapshot(req, res) {
  const { roomId } = req.params;
  const userId = req.user.id;
  const { label, description } = req.body;

  const version = await versionService.createSnapshot(roomId, userId, label, description);

  res.status(CONSTANTS.HTTP.CREATED).json({
    status: 'success',
    data: { version },
  });
}

export async function listVersions(req, res) {
  const { roomId } = req.params;
  const { page, limit } = req.query;

  const result = await versionService.listVersions(roomId, page, limit);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: result,
  });
}

export async function getVersionDetails(req, res) {
  const { roomId, versionId } = req.params;

  const version = await versionService.getVersionDetails(roomId, versionId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: { version },
  });
}

export async function computeVersionDiff(req, res) {
  const { roomId, versionId } = req.params;
  const { targetVersionId } = req.query;

  const diff = await versionService.computeVersionDiff(roomId, versionId, targetVersionId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    data: { diff },
  });
}

export async function restoreVersion(req, res) {
  const { roomId, versionId } = req.params;
  const userId = req.user.id;

  const result = await versionService.restoreVersion(roomId, userId, versionId);

  res.status(CONSTANTS.HTTP.OK).json({
    status: 'success',
    message: 'Room files successfully restored to specified version snapshot',
    data: result,
  });
}
