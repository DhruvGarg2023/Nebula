/**
 * Standardized error class for formatting errors thrown within socket event handlers.
 */
export class SocketError extends Error {
  constructor(message, code = 'SOCKET_ERROR', details = null) {
    super(message);
    this.name = 'SocketError';
    this.code = code;
    this.details = details;
    this.isOperational = true;

    // Capture stack trace (Node.js specific)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serializes the error for transmission over the network.
   * @returns {Object} JSON serializable object
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}
