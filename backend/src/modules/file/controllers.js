import * as fileService from './services.js';

export async function create(req, res) {
  const { roomId } = req.params;
  const file = await fileService.createFile(roomId, req.body);
  res.status(201).json({ status: 'success', data: { file } });
}

export async function getAll(req, res) {
  const { roomId } = req.params;
  const files = await fileService.getRoomFiles(roomId);
  res.status(200).json({ status: 'success', data: { files } });
}

export async function getOne(req, res) {
  const { roomId, fileId } = req.params;
  const file = await fileService.getFile(roomId, fileId);
  res.status(200).json({ status: 'success', data: { file } });
}

export async function update(req, res) {
  const { roomId, fileId } = req.params;
  const file = await fileService.updateFile(roomId, fileId, req.body);
  res.status(200).json({ status: 'success', data: { file } });
}

export async function remove(req, res) {
  const { roomId, fileId } = req.params;
  await fileService.deleteFile(roomId, fileId);
  res.status(204).send();
}
