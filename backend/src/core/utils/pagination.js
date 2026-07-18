import CONSTANTS from '../../config/constants.js';

/**
 * Parses pagination parameters from query string.
 *
 * Supports cursor-based pagination (not offset-based) because:
 * - Cursor pagination is stable under concurrent writes
 * - No "missing/duplicate items" when data shifts between pages
 * - More performant for large datasets (no OFFSET scan)
 *
 * @param {object} query - Express req.query
 * @param {string} [query.cursor] - Opaque cursor from previous response
 * @param {string|number} [query.limit] - Items per page
 * @returns {{ cursor: string|null, limit: number }}
 */
export function parsePagination(query) {
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || CONSTANTS.PAGINATION.DEFAULT_LIMIT, 1),
    CONSTANTS.PAGINATION.MAX_LIMIT
  );

  const cursor = query.cursor || null;

  return { cursor, limit };
}

/**
 * Builds pagination metadata for the response.
 *
 * @param {Array} items - The fetched items (fetch limit+1 to detect hasMore)
 * @param {number} limit - Requested limit
 * @param {Function} getCursor - Function to extract cursor from an item
 * @returns {{ data: Array, meta: { pagination: { cursor: string|null, hasMore: boolean, limit: number } } }}
 */
export function paginateResponse(items, limit, getCursor) {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const cursor = hasMore && data.length > 0 ? getCursor(data[data.length - 1]) : null;

  return {
    data,
    meta: {
      pagination: {
        cursor,
        hasMore,
        limit,
      },
    },
  };
}
