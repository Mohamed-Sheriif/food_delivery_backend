export const MILLISECONDS_IN_SECOND = 1000;
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const HOURS_IN_DAY = 24;

export function secondsToMilliseconds(seconds: number): number {
  return seconds * MILLISECONDS_IN_SECOND;
}

export function minutesToMilliseconds(minutes: number): number {
  return secondsToMilliseconds(minutes * SECONDS_IN_MINUTE);
}

export function hoursToMilliseconds(hours: number): number {
  return minutesToMilliseconds(hours * MINUTES_IN_HOUR);
}

export function daysToMilliseconds(days: number): number {
  return hoursToMilliseconds(days * HOURS_IN_DAY);
}
