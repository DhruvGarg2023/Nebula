import { describe, it, expect } from 'vitest';
import { parsePagination, paginateResponse } from './pagination.js';

describe('parsePagination', () => {
  it('should use defaults when no params provided', () => {
    const result = parsePagination({});

    expect(result.cursor).toBeNull();
    expect(result.limit).toBe(20);
  });

  it('should parse limit from query string', () => {
    const result = parsePagination({ limit: '50' });

    expect(result.limit).toBe(50);
  });

  it('should clamp limit to MAX_LIMIT', () => {
    const result = parsePagination({ limit: '999' });

    expect(result.limit).toBe(100);
  });

  it('should clamp limit to minimum 1', () => {
    const result = parsePagination({ limit: '-5' });

    expect(result.limit).toBe(1);
  });

  it('should parse cursor', () => {
    const result = parsePagination({ cursor: 'abc123' });

    expect(result.cursor).toBe('abc123');
  });

  it('should handle NaN limit gracefully', () => {
    const result = parsePagination({ limit: 'invalid' });

    expect(result.limit).toBe(20);
  });
});

describe('paginateResponse', () => {
  it('should detect hasMore when items exceed limit', () => {
    const items = [1, 2, 3, 4, 5, 6];
    const result = paginateResponse(items, 5, (item) => String(item));

    expect(result.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.meta.pagination.hasMore).toBe(true);
    expect(result.meta.pagination.cursor).toBe('5');
    expect(result.meta.pagination.limit).toBe(5);
  });

  it('should detect no more items when count matches limit', () => {
    const items = [1, 2, 3];
    const result = paginateResponse(items, 5, (item) => String(item));

    expect(result.data).toEqual([1, 2, 3]);
    expect(result.meta.pagination.hasMore).toBe(false);
    expect(result.meta.pagination.cursor).toBeNull();
  });

  it('should handle empty items', () => {
    const result = paginateResponse([], 20, (item) => item.id);

    expect(result.data).toEqual([]);
    expect(result.meta.pagination.hasMore).toBe(false);
    expect(result.meta.pagination.cursor).toBeNull();
  });
});
