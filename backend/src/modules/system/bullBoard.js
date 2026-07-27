import { compilerQueue } from '../../core/queue/index.js';
import { getGitHubQueue } from '../github/worker.js';
import { getAiQueue } from '../ai/worker.js';

export async function getQueueStatus(req, res) {
  try {
    const githubQueue = getGitHubQueue();
    const aiQueue = getAiQueue();

    const [compilerCounts, githubCounts, aiCounts] = await Promise.all([
      compilerQueue.getJobCounts('active', 'completed', 'failed', 'delayed', 'waiting'),
      githubQueue.getJobCounts('active', 'completed', 'failed', 'delayed', 'waiting'),
      aiQueue.getJobCounts('active', 'completed', 'failed', 'delayed', 'waiting'),
    ]);

    res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      queues: {
        'compiler-queue': compilerCounts,
        'github-queue': githubCounts,
        'ai-queue': aiCounts,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
}
