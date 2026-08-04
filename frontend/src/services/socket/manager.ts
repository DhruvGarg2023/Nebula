"use client";

import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "@/lib/constants";

/**
 * SocketManager — singleton manager for Socket.IO namespace connections.
 * 
 * Per Section 12 (lines 1078-1106) of frontend_architecture_plan.md:
 * - Maintains a Map of namespace → Socket instance
 * - Connects with auth token in handshake
 * - Supports reconnection with exponential backoff
 * - Cleans up all sockets on logout
 */
export class SocketManager {
  private sockets: Map<string, Socket> = new Map();
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_CONFIG.BASE_URL;
  }

  /**
   * Connect to a Socket.IO namespace. Returns existing socket if already connected.
   */
  connect(namespace: string, token: string): Socket {
    const key = namespace;

    // Return existing connected socket
    const existing = this.sockets.get(key);
    if (existing?.connected) return existing;

    // Disconnect stale socket before reconnecting
    if (existing) {
      existing.disconnect();
      this.sockets.delete(key);
    }

    const socket = io(`${this.baseUrl}${namespace}`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ["websocket", "polling"],
    });

    // Debug logging in development
    if (process.env.NODE_ENV === "development") {
      socket.on("connect", () => {
        console.log(`[Socket] Connected to ${namespace}`);
      });
      socket.on("disconnect", (reason) => {
        console.log(`[Socket] Disconnected from ${namespace}: ${reason}`);
      });
      socket.on("connect_error", (err) => {
        console.warn(`[Socket] Connection error on ${namespace}:`, err.message);
      });
    }

    this.sockets.set(key, socket);
    return socket;
  }

  /**
   * Get an existing socket for a namespace (without connecting).
   */
  getSocket(namespace: string): Socket | undefined {
    return this.sockets.get(namespace);
  }

  /**
   * Disconnect a specific namespace socket.
   */
  disconnect(namespace: string): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      this.sockets.delete(namespace);
    }
  }

  /**
   * Disconnect all namespace sockets (used on logout).
   */
  disconnectAll(): void {
    this.sockets.forEach((socket) => {
      socket.removeAllListeners();
      socket.disconnect();
    });
    this.sockets.clear();
  }

  /**
   * Check if a namespace is currently connected.
   */
  isConnected(namespace: string): boolean {
    return this.sockets.get(namespace)?.connected ?? false;
  }
}

// Singleton instance
export const socketManager = new SocketManager();
