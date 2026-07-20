import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import config from '../../../config/index.js';
import { initSockets } from '../../../core/sockets/index.js';
import { registerCollaborationNamespace } from '../sockets.js';
import * as collabService from '../services.js';
import * as roomRepo from '../../room/repositories.js';
import prisma from '../../../core/database/prisma.js';

// Mock dependencies
const { mockedIO } = vi.hoisted(() => ({ mockedIO: { current: null } }));

vi.mock('../../../core/sockets/index.js', () => ({
  getIO: () => mockedIO.current,
  initSockets: vi.fn()
}));

vi.mock('../../../core/database/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    }
  }
}));

vi.mock('../../room/repositories.js', () => ({
  findRoomById: vi.fn(),
  listRoomMembers: vi.fn()
}));

vi.mock('../services.js', () => ({
  trackPresence: vi.fn(),
  removePresence: vi.fn(),
  heartbeatPresence: vi.fn(),
  getRoomPresence: vi.fn()
}));

describe('Collaboration Socket Namespace', () => {
  let io, serverSocket, clientSocket;
  let port;

  beforeAll(async () => {
    const httpServer = createServer();
    // We don't want to use the real Redis adapter for unit tests to avoid needing Redis running
    // We'll initialize a clean Socket.IO server just for testing
    io = new Server(httpServer);
    mockedIO.current = io;

    // Register namespace
    registerCollaborationNamespace();

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  afterAll(() => {
    if (io) io.close();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject connection without token', async () => {
    const client = Client(`http://localhost:${port}/collaboration`);
    
    await new Promise((resolve) => {
      client.on('connect_error', (err) => {
        expect(err.message).toBe('Authentication Error: Token missing');
        client.close();
        resolve();
      });
    });
  });

  it('should accept connection with valid token', async () => {
    const mockUser = { id: 'user-1', name: 'Alice', email: 'alice@test.com' };
    const token = jwt.sign({ id: mockUser.id }, config.JWT_SECRET || 'secret');
    
    prisma.user.findUnique.mockResolvedValueOnce(mockUser);

    const client = Client(`http://localhost:${port}/collaboration`, {
      auth: { token }
    });

    await new Promise((resolve) => {
      client.on('connect', () => {
        expect(client.connected).toBe(true);
        client.close();
        resolve();
      });
    });
  });

  it('should allow joining a public room', async () => {
    const mockUser = { id: 'user-1', name: 'Alice', email: 'alice@test.com' };
    const token = jwt.sign({ id: mockUser.id }, config.JWT_SECRET || 'secret');
    
    prisma.user.findUnique.mockResolvedValue(mockUser);
    roomRepo.findRoomById.mockResolvedValue({ id: 'room-1', isPublic: true });
    collabService.getRoomPresence.mockResolvedValue([{ userId: 'user-1', name: 'Alice' }]);

    const client = Client(`http://localhost:${port}/collaboration`, {
      auth: { token }
    });

    await new Promise((resolve) => {
      client.on('connect', () => {
        client.emit('join_room', { roomId: 'room-1' }, (response) => {
          expect(response.success).toBe(true);
          expect(collabService.trackPresence).toHaveBeenCalled();
          client.close();
          resolve();
        });
      });
    });
  });

  it('should reject joining a private room if not a member', async () => {
    const mockUser = { id: 'user-1', name: 'Alice', email: 'alice@test.com' };
    const token = jwt.sign({ id: mockUser.id }, config.JWT_SECRET || 'secret');
    
    prisma.user.findUnique.mockResolvedValue(mockUser);
    roomRepo.findRoomById.mockResolvedValue({ id: 'room-1', isPublic: false });
    roomRepo.listRoomMembers.mockResolvedValue([]); // User is not in this list

    const client = Client(`http://localhost:${port}/collaboration`, {
      auth: { token }
    });

    await new Promise((resolve) => {
      client.on('connect', () => {
        client.emit('join_room', { roomId: 'room-1' }, (response) => {
          expect(response.success).toBe(false);
          expect(response.error.code).toBe('FORBIDDEN');
          client.close();
          resolve();
        });
      });
    });
  });
});
