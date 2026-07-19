import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../services.js';
import * as authRepo from '../repositories.js';
import { AuthenticationError } from '../../../core/errors/AppError.js';
import { hashToken } from '../../../core/utils/crypto.js';

// Mock the repository layer
vi.mock('../repositories.js');

describe('Auth Services', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    deletedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('JWT Operations', () => {
    it('should generate and verify an access token', () => {
      const token = authService.generateAccessToken(mockUser);
      expect(typeof token).toBe('string');

      const decoded = authService.verifyAccessToken(token);
      expect(decoded.sub).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.name).toBe(mockUser.name);
    });

    it('should throw AuthenticationError for invalid token', () => {
      expect(() => authService.verifyAccessToken('invalid.token.here')).toThrow(AuthenticationError);
    });
  });

  describe('refreshAccessToken', () => {
    it('should rotate token successfully if valid', async () => {
      const rawToken = 'valid-token';
      const tokenHash = hashToken(rawToken);
      
      const storedToken = {
        id: 'token-123',
        userId: mockUser.id,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
        user: mockUser,
      };

      authRepo.findRefreshTokenByHash.mockResolvedValue(storedToken);
      authRepo.revokeRefreshToken.mockResolvedValue();
      authRepo.createRefreshToken.mockResolvedValue();

      const result = await authService.refreshAccessToken(rawToken);

      expect(authRepo.findRefreshTokenByHash).toHaveBeenCalledWith(tokenHash);
      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(storedToken.id);
      expect(authRepo.createRefreshToken).toHaveBeenCalled();
      
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toEqual(mockUser);
    });

    it('should throw AuthenticationError and revoke ALL tokens if token is already revoked (Reuse Detection)', async () => {
      const rawToken = 'stolen-token';
      
      const storedToken = {
        id: 'token-123',
        userId: mockUser.id,
        isRevoked: true, // Already revoked
        expiresAt: new Date(Date.now() + 100000),
        user: mockUser,
      };

      authRepo.findRefreshTokenByHash.mockResolvedValue(storedToken);
      authRepo.revokeAllUserRefreshTokens.mockResolvedValue();

      await expect(authService.refreshAccessToken(rawToken)).rejects.toThrow(AuthenticationError);
      
      // Crucial security check: should revoke all user tokens
      expect(authRepo.revokeAllUserRefreshTokens).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw AuthenticationError if token has expired', async () => {
      const rawToken = 'expired-token';
      
      const storedToken = {
        id: 'token-123',
        userId: mockUser.id,
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000), // In the past
        user: mockUser,
      };

      authRepo.findRefreshTokenByHash.mockResolvedValue(storedToken);

      await expect(authService.refreshAccessToken(rawToken)).rejects.toThrow(AuthenticationError);
      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(storedToken.id);
    });

    it('should throw AuthenticationError if user is soft deleted', async () => {
      const rawToken = 'valid-token';
      
      const storedToken = {
        id: 'token-123',
        userId: mockUser.id,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
        user: { ...mockUser, deletedAt: new Date() }, // Soft deleted
      };

      authRepo.findRefreshTokenByHash.mockResolvedValue(storedToken);

      await expect(authService.refreshAccessToken(rawToken)).rejects.toThrow(AuthenticationError);
      expect(authRepo.revokeAllUserRefreshTokens).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('logout', () => {
    it('should revoke token if valid and not already revoked', async () => {
      const rawToken = 'valid-token';
      const storedToken = {
        id: 'token-123',
        userId: mockUser.id,
        isRevoked: false,
      };

      authRepo.findRefreshTokenByHash.mockResolvedValue(storedToken);

      await authService.logout(rawToken);

      expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(storedToken.id);
    });

    it('should do nothing if token is already revoked or missing', async () => {
      const rawToken = 'revoked-token';
      const storedToken = {
        id: 'token-123',
        userId: mockUser.id,
        isRevoked: true,
      };

      authRepo.findRefreshTokenByHash.mockResolvedValue(storedToken);

      await authService.logout(rawToken);

      expect(authRepo.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });
});
