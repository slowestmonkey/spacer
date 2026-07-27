/**
 * Ports of the handful of Godot `Time` singleton methods the game relies on.
 *
 * Godot's semantics are reproduced deliberately, including the asymmetry that
 * makes the original tick the way it does:
 *
 *   - `Time.get_datetime_string_from_system()` and `Time.get_date_string_from_system()`
 *     format the *local* wall clock and carry no timezone marker.
 *   - `Time.get_unix_time_from_datetime_string()` and
 *     `Time.get_unix_time_from_datetime_dict()` interpret their argument as *UTC*.
 *
 * So a timestamp written by `save_goal()` and read back by `should_update_goal()`
 * is offset by the device's UTC offset. Both sides of every comparison in the
 * game go through the same pair of calls, so the offset cancels out; keeping the
 * behaviour identical means the ported goal expiry and goal validation land on
 * exactly the same days as the Godot build.
 */

export interface DatetimeDict {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
  second: number;
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/** `Time.get_datetime_string_from_system()` -> "2025-07-26T10:33:12" (local). */
export function getDatetimeStringFromSystem(now: Date = new Date()): string {
  return (
    `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}

/** `Time.get_date_string_from_system()` -> "2025-07-26" (local). */
export function getDateStringFromSystem(now: Date = new Date()): string {
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** `Time.get_datetime_dict_from_system()` (local, `utc = false`). */
export function getDatetimeDictFromSystem(now: Date = new Date()): DatetimeDict {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    weekday: now.getDay(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
  };
}

/** `Time.get_unix_time_from_system()` — seconds since the Unix epoch. */
export function getUnixTimeFromSystem(now: Date = new Date()): number {
  return Math.floor(now.getTime() / 1000);
}

const DATETIME_PATTERN =
  /^(\d{1,4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;

/**
 * `Time.get_datetime_dict_from_datetime_string(datetime, weekday)`.
 *
 * Returns `null` for a string Godot would reject; callers decide what to do
 * with it (Godot itself pushes an error and returns an empty dictionary).
 */
export function getDatetimeDictFromDatetimeString(
  datetime: string,
  weekday: boolean,
): DatetimeDict | null {
  const match = DATETIME_PATTERN.exec(datetime.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = match[4] === undefined ? 0 : Number(match[4]);
  const minute = match[5] === undefined ? 0 : Number(match[5]);
  const second = match[6] === undefined ? 0 : Number(match[6]);

  return {
    year,
    month,
    day,
    weekday: weekday ? new Date(Date.UTC(year, month - 1, day)).getUTCDay() : 0,
    hour,
    minute,
    second,
  };
}

/**
 * `Time.get_unix_time_from_datetime_string(datetime)`.
 *
 * The string is read as UTC, and anything unparsable (including the empty
 * string a fresh install starts with) yields 0 — the behaviour
 * `Goal.should_update_goal()` depends on to force the first goal calculation.
 */
export function getUnixTimeFromDatetimeString(datetime: string): number {
  const parsed = getDatetimeDictFromDatetimeString(datetime, false);
  if (!parsed) {
    return 0;
  }
  return getUnixTimeFromDatetimeDict(parsed);
}

/** `Time.get_unix_time_from_datetime_dict(datetime)` — the dict is read as UTC. */
export function getUnixTimeFromDatetimeDict(
  datetime: Pick<DatetimeDict, 'year' | 'month' | 'day'> & Partial<DatetimeDict>,
): number {
  return Math.floor(
    Date.UTC(
      datetime.year,
      datetime.month - 1,
      datetime.day,
      datetime.hour ?? 0,
      datetime.minute ?? 0,
      datetime.second ?? 0,
    ) / 1000,
  );
}

/**
 * `world.gd -> get_start_of_today_unix()`: today's local calendar date, zeroed
 * to midnight, then converted through the UTC-based dict conversion.
 */
export function getStartOfTodayUnix(now: Date = new Date()): number {
  const today = getDatetimeDictFromSystem(now);
  return getUnixTimeFromDatetimeDict({ ...today, hour: 0, minute: 0, second: 0 });
}

/**
 * `game_over.gd -> format_date(Time.get_datetime_dict_from_datetime_string(value, true))`,
 * i.e. `"%04d-%02d-%02d"`.
 *
 * Returns an empty string for a value that was never written — a fresh install
 * reaching the game over screen without a journey start date.
 */
export function formatDateFromDatetimeString(datetime: string): string {
  const parsed = getDatetimeDictFromDatetimeString(datetime, true);
  if (!parsed) {
    return '';
  }
  return `${pad(parsed.year, 4)}-${pad(parsed.month)}-${pad(parsed.day)}`;
}

/** GDScript's `randi_range(from, to)` — inclusive on both ends. */
export function randiRange(from: number, to: number): number {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}
