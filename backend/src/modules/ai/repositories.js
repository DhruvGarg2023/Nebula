import prisma from '../../core/database/prisma.js';

export async function createAiReview(roomId, userId, fileId = null) {
  return prisma.aiReview.create({
    data: {
      roomId,
      userId,
      fileId,
      status: 'queued',
    },
  });
}

export async function updateAiReviewStatus(reviewId, status, summary = null, issues = [], suggestions = [], costUsd = 0.001) {
  return prisma.aiReview.update({
    where: { id: reviewId },
    data: {
      status,
      summary,
      issues,
      suggestions,
      costUsd,
      completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
    },
  });
}

export async function getAiReviewById(reviewId) {
  return prisma.aiReview.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      file: {
        select: { id: true, name: true, language: true },
      },
    },
  });
}

/**
 * Count total AI requests made by user today (00:00:00 UTC to present).
 */
export async function getUserDailyRequestCount(userId) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  return prisma.aiReview.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
  });
}

/**
 * Calculate total estimated cost USD of AI reviews generated in current month.
 */
export async function getMonthlySystemCost() {
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const aggregate = await prisma.aiReview.aggregate({
    _sum: { costUsd: true },
    where: {
      createdAt: { gte: startOfMonth },
    },
  });

  return aggregate._sum.costUsd || 0.0;
}
