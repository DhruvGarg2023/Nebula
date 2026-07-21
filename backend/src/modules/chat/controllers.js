import * as chatService from './services.js';

export async function getHistory(req, res) {
  const { roomId } = req.params;
  const { limit, cursor } = req.query;

  const result = await chatService.getRoomMessages(
    roomId,
    limit ? parseInt(limit, 10) : 50,
    cursor || null
  );

  res.status(200).json({
    status: 'success',
    data: result,
  });
}
