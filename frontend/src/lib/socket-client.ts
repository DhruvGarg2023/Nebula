import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketManager {
  private static instance: SocketManager;
  private sockets: Map<string, Socket> = new Map();

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public getSocket(namespace: string): Socket {
    const nsKey = namespace.startsWith('/') ? namespace : `/${namespace}`;
    
    if (!this.sockets.has(nsKey)) {
      const socket = io(`${SOCKET_SERVER_URL}${nsKey}`, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log(`[Socket.IO] Connected to namespace: ${nsKey} (ID: ${socket.id})`);
      });

      socket.on('connect_error', (err) => {
        console.warn(`[Socket.IO] Connection error on ${nsKey}:`, err.message);
      });

      this.sockets.set(nsKey, socket);
    }

    return this.sockets.get(nsKey)!;
  }

  public disconnectAll() {
    this.sockets.forEach((socket, ns) => {
      socket.disconnect();
      console.log(`[Socket.IO] Disconnected namespace: ${ns}`);
    });
    this.sockets.clear();
  }
}

export const socketManager = SocketManager.getInstance();
