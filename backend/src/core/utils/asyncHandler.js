/**
 * Wraps an async Express route handler to catch rejected promises
 * and forward them to the global error handler via next().
 *
 * Without this, async errors would result in unhandled promise rejections
 * and the client would hang (no response sent).
 *
 * Usage:
 *   router.get('/rooms', asyncHandler(async (req, res) => { ... }))
 *
 * @param {Function} fn - Async route handler
 * @returns {import('express').RequestHandler}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      next(err);
    }
  };
}

export default asyncHandler;
