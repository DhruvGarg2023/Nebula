import prisma from '../../core/database/prisma.js';
import { encryptSymmetric, decryptSymmetric } from '../../core/utils/crypto.js';

/**
 * Encrypted repository access for GitHub User Tokens.
 */

export async function upsertGitHubToken(userId, accessToken, username, refreshToken = null, expiresAt = null) {
  const encryptedAccess = encryptSymmetric(accessToken);
  const encryptedRefresh = refreshToken ? encryptSymmetric(refreshToken) : null;

  return prisma.gitHubToken.upsert({
    where: { userId },
    create: {
      userId,
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      username,
      expiresAt,
    },
    update: {
      accessToken: encryptedAccess,
      refreshToken: encryptedRefresh,
      username,
      expiresAt,
    },
  });
}

export async function getGitHubToken(userId) {
  const tokenRecord = await prisma.gitHubToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) return null;

  return {
    ...tokenRecord,
    accessToken: decryptSymmetric(tokenRecord.accessToken),
    refreshToken: tokenRecord.refreshToken ? decryptSymmetric(tokenRecord.refreshToken) : null,
  };
}

export async function deleteGitHubToken(userId) {
  return prisma.gitHubToken.deleteMany({
    where: { userId },
  });
}
