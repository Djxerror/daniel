const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function fmt(n: number): string {
  const v = Math.round(n);
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    const digits = abs >= 10_000_000 ? 0 : 1;
    return `${sign}${(abs / 1_000_000).toFixed(digits).replace(/\.0$/, "")}M`;
  }
  if (abs >= 10_000) return `${sign}${Math.round(abs / 1000)}K`;
  if (abs >= 1_000) return `${sign}${(abs / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${sign}${abs.toLocaleString("en-US")}`;
}

export function money(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${fmt(Math.abs(n))}`;
}

/** Exact dollars when the short form would make a price and a smaller balance look equal. */
export function moneyPair(price: number, cash: number): [string, string] {
  const compactPrice = money(price);
  const compactCash = money(cash);
  if (compactPrice !== compactCash || Math.round(price) === Math.round(cash)) return [compactPrice, compactCash];
  const exact = (n: number) => {
    const sign = n < 0 ? "-" : "";
    return `${sign}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
  };
  return [exact(price), exact(cash)];
}

function dateFromDay(day: number, year?: number) {
  if (!year) {
    const dt = new Date(Date.UTC(2026, 2, 2));
    dt.setUTCDate(dt.getUTCDate() + Math.max(0, day - 1));
    return dt;
  }
  const dt = new Date(Date.UTC(year, 0, 1));
  dt.setUTCDate(dt.getUTCDate() + Math.max(0, day - 1));
  return dt;
}

/** Day 1 is Monday, March 2, 2026, unless a career year is set. */
export function dateLabel(day: number, year?: number): string {
  const dt = dateFromDay(day, year);
  return `${WEEKDAYS[dt.getUTCDay()]} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
}

/** Phone-sim date: 01.01.2019 · Tuesday */
export function simDate(day: number, year?: number): string {
  const dt = dateFromDay(day, year);
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${dt.getUTCFullYear()} · ${WEEKDAYS_LONG[dt.getUTCDay()]}`;
}

/** 01.01.19 */
export function shortStamp(day: number, year?: number): string {
  const dt = dateFromDay(day, year);
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${String(dt.getUTCFullYear()).slice(2)}`;
}

export function weekdayLong(day: number, year?: number): string {
  return WEEKDAYS_LONG[dateFromDay(day, year).getUTCDay()] ?? "";
}

/** 0 if today is Friday, else days until the next one. */
export function daysUntilFriday(day: number, year?: number): number {
  const wd = dateFromDay(day, year).getUTCDay();
  return (5 - wd + 7) % 7;
}

/** Next Friday you can still wake up into. Today is already morning, so it never counts. */
export function nextReleaseOffset(day: number, year?: number): number {
  const until = daysUntilFriday(day, year);
  return until === 0 ? 7 : until;
}

/** Days ahead for the date picker. An existing date stays put. Otherwise the next Friday. */
export function releaseOffset(day: number, dropOn: number | null | undefined, year?: number): number {
  if (dropOn != null && dropOn > day) return Math.max(1, Math.min(21, dropOn - day));
  return nextReleaseOffset(day, year);
}

export function isFriday(day: number, year?: number): boolean {
  return dateFromDay(day, year).getUTCDay() === 5;
}

/** Age after whole calendar years from day 1. Day 1 is the birthday. */
export function careerAge(bornAge: number, day: number, startYear: number): number {
  const year = startYear > 0 ? startYear : undefined;
  const start = dateFromDay(1, year);
  const now = dateFromDay(Math.max(1, day), year);
  let years = now.getUTCFullYear() - start.getUTCFullYear();
  const before =
    now.getUTCMonth() < start.getUTCMonth() ||
    (now.getUTCMonth() === start.getUTCMonth() && now.getUTCDate() < start.getUTCDate());
  if (before) years -= 1;
  return Math.min(80, bornAge + Math.max(0, years));
}

export function isWeekday(day: number, year?: number): boolean {
  const name = weekdayLong(day, year);
  return name !== "Saturday" && name !== "Sunday";
}
