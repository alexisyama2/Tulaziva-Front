import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatBytes, formatPrice, isExpired, isFeatured, parseUtc, timeAgo } from './format';

describe('parseUtc', () => {
  it('treats a timestamp without offset as UTC (the API omits the Z)', () => {
    expect(parseUtc('2026-11-05T23:41:15.6062779').toISOString()).toBe('2026-11-05T23:41:15.606Z');
  });

  it('keeps explicit Z and numeric offsets untouched', () => {
    expect(parseUtc('2026-11-05T10:00:00Z').toISOString()).toBe('2026-11-05T10:00:00.000Z');
    expect(parseUtc('2026-11-05T10:00:00+02:00').toISOString()).toBe('2026-11-05T08:00:00.000Z');
  });
});

describe('relative time', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('formats past dates', () => {
    expect(timeAgo('2026-11-05T09:00:00')).toBe('3 hours ago');
    expect(timeAgo('2026-11-04T12:00:00')).toBe('yesterday');
  });

  it('detects expiration', () => {
    expect(isExpired('2026-11-05T11:59:00')).toBe(true);
    expect(isExpired('2026-12-05T00:00:00')).toBe(false);
  });
});

describe('formatPrice', () => {
  it('formats with the given currency and no decimals for whole amounts', () => {
    expect(formatPrice(9500, 'USD')).toBe('$9,500');
    expect(formatPrice(9.5, 'USD')).toBe('$9.50');
  });

  it('falls back for an unknown currency code', () => {
    expect(formatPrice(10, 'NOPE!')).toBe('10 NOPE!');
  });
});

describe('formatBytes', () => {
  it('picks a sensible unit', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('isFeatured', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('is true only while the end of the featuring is in the future', () => {
    expect(isFeatured('2026-11-06T12:00:00')).toBe(true);
    expect(isFeatured('2026-11-05T11:59:59')).toBe(false);
  });

  it('is false when the ad was never featured', () => {
    expect(isFeatured(null)).toBe(false);
    expect(isFeatured(undefined)).toBe(false);
  });
});
