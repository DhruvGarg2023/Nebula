"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { socketManager } from "@/services/socket/manager";
import { getAccessToken } from "@/services/api/client";
import { useAuth } from "@/providers/auth-provider";

// ═══════════════════════════════════════════════════════════════
// Socket Context
// ═══════════════════════════════════════════════════════════════

interface SocketContextValue {
  /** Connect to a Socket.IO namespace. Returns the socket instance. */
  connect: (namespace: string) => Socket | null;
  /** Disconnect a specific namespace socket. */
  disconnect: (namespace: string) => void;
  /** Get an existing socket for a namespace. */
  getSocket: (namespace: string) => Socket | undefined;
  /** Check if a namespace is currently connected. */
  isConnected: (namespace: string) => boolean;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════
// Socket Provider
// ═══════════════════════════════════════════════════════════════

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * SocketProvider — provides Socket.IO namespace management to the component tree.
 * 
 * Wraps the dashboard layout so all authenticated pages can connect to
 * Socket.IO namespaces (/collaboration, /editor, /chat, /compiler).
 * 
 * Auto-disconnects all sockets when the user logs out or the provider unmounts.
 */
export function SocketProvider({ children }: SocketProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const tokenRef = useRef<string | null>(null);

  // Keep a ref to the current access token for socket auth
  useEffect(() => {
    tokenRef.current =
      getAccessToken() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null);
  }, [user, isAuthenticated]);

  const connect = useCallback(
    (namespace: string): Socket | null => {
      const token =
        getAccessToken() ||
        tokenRef.current ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null);
      if (!token) {
        console.warn("[SocketProvider] No access token available for socket connection");
        return null;
      }
      return socketManager.connect(namespace, token);
    },
    []
  );

  const disconnect = useCallback((namespace: string) => {
    socketManager.disconnect(namespace);
  }, []);

  const getSocket = useCallback((namespace: string) => {
    return socketManager.getSocket(namespace);
  }, []);

  const isConnected = useCallback((namespace: string) => {
    return socketManager.isConnected(namespace);
  }, []);

  // Disconnect all sockets on unmount or when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      socketManager.disconnectAll();
    }

    return () => {
      socketManager.disconnectAll();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{ connect, disconnect, getSocket, isConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return ctx;
}
