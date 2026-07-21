import * as compilerService from './services.js';

export async function execute(req, res) {
  const { roomId } = req.params;
  const { language, sourceCode, fileId } = req.body;

  const job = await compilerService.submitExecutionJob({
    roomId,
    userId: req.user.id,
    fileId,
    language,
    sourceCode,
  });

  res.status(202).json({
    status: 'success',
    message: 'Code execution job queued',
    data: { job },
  });
}

export async function getHistory(req, res) {
  const { roomId } = req.params;
  const { limit, cursor } = req.query;

  const result = await compilerService.getRoomJobs(
    roomId,
    limit ? parseInt(limit, 10) : 20,
    cursor || null
  );

  res.status(200).json({
    status: 'success',
    data: result,
  });
}

export async function getJob(req, res) {
  const { roomId, jobId } = req.params;
  const job = await compilerService.getJobById(roomId, jobId);

  res.status(200).json({
    status: 'success',
    data: { job },
  });
}
