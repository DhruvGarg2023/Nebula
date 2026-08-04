// ═══════════════════════════════════════════════════════════════
// Application Constants
// ═══════════════════════════════════════════════════════════════

/**
 * Route paths — single source of truth for all frontend routes.
 */
export const ROUTES = {
  // Marketing
  HOME: "/",

  // Auth
  LOGIN: "/login",
  DEV_LOGIN: "/dev-login",
  AUTH_CALLBACK: "/auth/callback",

  // Dashboard
  DASHBOARD: "/dashboard",

  // Rooms
  ROOMS: "/rooms",
  ROOM: (roomId: string) => `/rooms/${roomId}` as const,
  ROOM_SETTINGS: (roomId: string) => `/rooms/${roomId}/settings` as const,

  // AI
  AI: "/ai",

  // Notifications
  NOTIFICATIONS: "/notifications",

  // Settings
  SETTINGS: "/settings",
  SETTINGS_PROFILE: "/settings/profile",
  SETTINGS_PREFERENCES: "/settings/preferences",
  SETTINGS_INTEGRATIONS: "/settings/integrations",
  SETTINGS_ACCOUNT: "/settings/account",

  // Public
  INVITE: (token: string) => `/invite/${token}` as const,
} as const;

/**
 * React Query cache keys — structured factory pattern.
 */
export const QUERY_KEYS = {
  // Auth
  auth: {
    session: ["auth", "session"] as const,
  },

  // Users
  users: {
    me: ["users", "me"] as const,
    search: (query: string) => ["users", "search", query] as const,
  },

  // Rooms
  rooms: {
    all: ["rooms"] as const,
    lists: () => [...QUERY_KEYS.rooms.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...QUERY_KEYS.rooms.lists(), filters] as const,
    details: () => [...QUERY_KEYS.rooms.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.rooms.details(), id] as const,
    members: (id: string) =>
      [...QUERY_KEYS.rooms.detail(id), "members"] as const,
    invitations: (id: string) =>
      [...QUERY_KEYS.rooms.detail(id), "invitations"] as const,
  },

  // Files
  files: {
    all: (roomId: string) => ["rooms", roomId, "files"] as const,
    detail: (roomId: string, fileId: string) =>
      [...QUERY_KEYS.files.all(roomId), fileId] as const,
  },

  // Chat
  chat: {
    messages: (roomId: string) => ["rooms", roomId, "messages"] as const,
  },

  // Compiler
  compiler: {
    jobs: (roomId: string) => ["rooms", roomId, "compiler", "jobs"] as const,
    job: (roomId: string, jobId: string) =>
      [...QUERY_KEYS.compiler.jobs(roomId), jobId] as const,
  },

  // Versions
  versions: {
    all: (roomId: string) => ["rooms", roomId, "versions"] as const,
    detail: (roomId: string, versionId: string) =>
      [...QUERY_KEYS.versions.all(roomId), versionId] as const,
    diff: (roomId: string, versionId: string, targetId?: string) =>
      [...QUERY_KEYS.versions.detail(roomId, versionId), "diff", targetId] as const,
  },

  // GitHub
  github: {
    status: ["github", "status"] as const,
    repos: ["github", "repos"] as const,
  },

  // AI
  ai: {
    review: (reviewId: string) => ["ai", "reviews", reviewId] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (filters: Record<string, unknown>) =>
      [...QUERY_KEYS.notifications.all, filters] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
} as const;

/**
 * Socket.IO event names — typed constants.
 */
export const SOCKET_EVENTS = {
  // Collaboration namespace
  collaboration: {
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    HEARTBEAT: "heartbeat",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
  },

  // Editor namespace
  editor: {
    JOIN: "editor:join",
    CHANGE: "editor:change",
    UPDATE: "editor:update",
    CURSOR_MOVE: "cursor:move",
    CURSOR_UPDATE: "cursor:update",
    SELECTION_CHANGE: "selection:change",
    SELECTION_UPDATE: "selection:update",
    TYPING_START: "typing:start",
    TYPING_STOP: "typing:stop",
  },

  // Chat namespace
  chat: {
    JOIN: "chat:join",
    SEND: "chat:send",
    RECEIVE: "chat:receive",
    TYPING_START: "chat:typing:start",
    TYPING_STOP: "chat:typing:stop",
  },

  // Compiler namespace
  compiler: {
    JOIN: "compiler:join",
    STDOUT: "compiler:stdout",
    STDERR: "compiler:stderr",
    DONE: "compiler:done",
  },

  // Notifications (default namespace)
  notification: (userId: string) => `user:${userId}:notification` as const,
} as const;

/**
 * API configuration
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  API_PREFIX: "/api/v1",
  TIMEOUT: 15_000,
} as const;

/**
 * Stale times for React Query (in milliseconds).
 */
export const STALE_TIMES = {
  USER: 5 * 60 * 1000,         // 5 min — profile rarely changes
  ROOMS: 30 * 1000,            // 30s — rooms change infrequently
  FILES: 10 * 1000,            // 10s — files change during editing
  MESSAGES: 0,                 // Always stale — rely on socket updates
  NOTIFICATIONS: 30 * 1000,    // 30s — supplemented by socket push
  VERSIONS: 60 * 1000,         // 1 min
  GITHUB: 60 * 1000,           // 1 min
  COMPILER_JOBS: 30 * 1000,    // 30s
} as const;

/**
 * Roles hierarchy (ascending permissions).
 */
export const ROLES = {
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
} as const;

export const ROLE_HIERARCHY = ["viewer", "editor", "admin"] as const;

/**
 * Supported programming languages (matches backend compiler).
 */
export const SUPPORTED_LANGUAGES = [
  { value: "c", label: "C", extension: ".c", monacoId: "c" },
  { value: "cpp", label: "C++", extension: ".cpp", monacoId: "cpp" },
  { value: "python", label: "Python", extension: ".py", monacoId: "python" },
  { value: "javascript", label: "JavaScript", extension: ".js", monacoId: "javascript" },
] as const;

/**
 * Pagination defaults.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * LocalStorage keys.
 */
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "codesync:sidebar-collapsed",
  THEME: "codesync:theme",
  EDITOR_THEME: "codesync:editor-theme",
  EDITOR_FONT_SIZE: "codesync:editor-font-size",
} as const;

