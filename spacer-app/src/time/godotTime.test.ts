import {
  formatDateFromDatetimeString,
  getDateStringFromSystem,
  getDatetimeDictFromDatetimeString,
  getDatetimeStringFromSystem,
  getStartOfTodayUnix,
  getUnixTimeFromDatetimeDict,
  getUnixTimeFromDatetimeString,
  getUnixTimeFromSystem,
  randiRange,
} from './godotTime';

describe('getDatetimeStringFromSystem', () => {
  it('formats the local wall clock the way Godot does', () => {
    const now = new Date(2025, 6, 26, 9, 5, 3);
    expect(getDatetimeStringFromSystem(now)).toBe('2025-07-26T09:05:03');
  });

  it('zero-pads a year below 1000', () => {
    const now = new Date(2025, 0, 1, 0, 0, 0);
    now.setFullYear(999);
    expect(getDatetimeStringFromSystem(now)).toBe('0999-01-01T00:00:00');
  });
});

describe('getDateStringFromSystem', () => {
  it('drops the time component', () => {
    expect(getDateStringFromSystem(new Date(2025, 11, 5, 23, 59, 59))).toBe('2025-12-05');
  });
});

describe('getUnixTimeFromDatetimeString', () => {
  it('reads a date-only string as UTC midnight', () => {
    expect(getUnixTimeFromDatetimeString('2023-10-01')).toBe(Date.UTC(2023, 9, 1) / 1000);
  });

  it('reads a full timestamp as UTC', () => {
    expect(getUnixTimeFromDatetimeString('2023-10-01T12:30:45')).toBe(
      Date.UTC(2023, 9, 1, 12, 30, 45) / 1000,
    );
  });

  it('accepts a space separator', () => {
    expect(getUnixTimeFromDatetimeString('2023-10-01 12:30:45')).toBe(
      Date.UTC(2023, 9, 1, 12, 30, 45) / 1000,
    );
  });

  it('returns 0 for the empty string a fresh install starts with', () => {
    expect(getUnixTimeFromDatetimeString('')).toBe(0);
  });

  it('returns 0 for an unparsable value', () => {
    expect(getUnixTimeFromDatetimeString('not-a-date')).toBe(0);
  });
});

describe('getDatetimeDictFromDatetimeString', () => {
  it('extracts the calendar fields', () => {
    expect(getDatetimeDictFromDatetimeString('2025-04-08T21:15:00', false)).toEqual({
      year: 2025,
      month: 4,
      day: 8,
      weekday: 0,
      hour: 21,
      minute: 15,
      second: 0,
    });
  });

  it('computes the weekday when asked', () => {
    // 2025-04-08 was a Tuesday.
    expect(getDatetimeDictFromDatetimeString('2025-04-08', true)?.weekday).toBe(2);
  });

  it('returns null for a malformed string', () => {
    expect(getDatetimeDictFromDatetimeString('2025/04/08', true)).toBeNull();
  });
});

describe('getUnixTimeFromDatetimeDict', () => {
  it('treats the dictionary as UTC', () => {
    expect(getUnixTimeFromDatetimeDict({ year: 2025, month: 7, day: 26 })).toBe(
      Date.UTC(2025, 6, 26) / 1000,
    );
  });
});

describe('getStartOfTodayUnix', () => {
  it('zeroes the clock on the local calendar date', () => {
    const now = new Date(2025, 6, 26, 17, 42, 11);
    expect(getStartOfTodayUnix(now)).toBe(Date.UTC(2025, 6, 26) / 1000);
  });

  it('lands strictly after yesterday and before tomorrow', () => {
    const now = new Date(2025, 6, 26, 17, 42, 11);
    expect(getStartOfTodayUnix(now)).toBeGreaterThan(getUnixTimeFromDatetimeString('2025-07-25'));
    expect(getStartOfTodayUnix(now)).toBeLessThan(getUnixTimeFromDatetimeString('2025-07-27'));
  });
});

describe('getUnixTimeFromSystem', () => {
  it('returns whole seconds since the epoch', () => {
    const now = new Date(2025, 6, 26, 9, 5, 3);
    expect(getUnixTimeFromSystem(now)).toBe(Math.floor(now.getTime() / 1000));
  });
});

describe('formatDateFromDatetimeString', () => {
  it('renders the journey start date', () => {
    expect(formatDateFromDatetimeString('2025-04-08T21:15:00')).toBe('2025-04-08');
  });

  it('zero-pads single digit months and days', () => {
    expect(formatDateFromDatetimeString('2025-1-2T00:00:00')).toBe('2025-01-02');
  });

  it('renders nothing when no journey was ever started', () => {
    expect(formatDateFromDatetimeString('')).toBe('');
  });
});

describe('randiRange', () => {
  it('stays within the inclusive bounds', () => {
    for (let i = 0; i < 200; i += 1) {
      const value = randiRange(10, 10000);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(10000);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('can return both endpoints', () => {
    const random = jest.spyOn(Math, 'random');

    random.mockReturnValue(0);
    expect(randiRange(10, 10000)).toBe(10);

    random.mockReturnValue(0.9999999);
    expect(randiRange(10, 10000)).toBe(10000);

    random.mockRestore();
  });
});
