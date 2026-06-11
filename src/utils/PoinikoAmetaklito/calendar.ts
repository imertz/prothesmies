const DAY_MS = 24 * 60 * 60 * 1000;

const shiftedLabourDays: Record<number, string> = {
  2021: '2021-05-04',
  2022: '2022-05-02',
  2024: '2024-05-07',
};

export function parseIsoDate(value: string, field: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError(`${field} must use YYYY-MM-DD format`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (formatIsoDate(date) !== value) {
    throw new TypeError(`${field} is not a valid calendar date`);
  }
  return date;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function orthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  const julian = new Date(Date.UTC(year, month - 1, day));
  const century = Math.floor(year / 100);
  const gregorianOffset = century - Math.floor(century / 4) - 2;
  return addUtcDays(julian, gregorianOffset);
}

function isAugust(date: Date): boolean {
  return date.getUTCMonth() === 7;
}

function isHoliday(date: Date): boolean {
  const day = date.getUTCDay();
  if (day === 0 || day === 6) return true;

  const iso = formatIsoDate(date);
  const monthDay = iso.slice(5);
  if (
    [
      '01-01',
      '01-06',
      '03-25',
      '05-01',
      '08-15',
      '10-03',
      '10-28',
      '12-25',
      '12-26',
    ].includes(monthDay)
  ) {
    return true;
  }

  if (shiftedLabourDays[date.getUTCFullYear()] === iso) return true;

  const easter = orthodoxEaster(date.getUTCFullYear());
  return [-48, -2, -1, 1, 50].some(
    offset => formatIsoDate(addUtcDays(easter, offset)) === iso
  );
}

function shiftToWorkingDay(date: Date): Date {
  let result = date;
  while (isAugust(result) || isHoliday(result)) {
    result = addUtcDays(result, 1);
  }
  return result;
}

export interface LegalDeadlineComputation {
  expiresOn: string;
  nominalEnd: string;
  augustDaysSkipped: number;
  shifted: boolean;
}

function finishComputation(nominal: Date, augustDaysSkipped: number): LegalDeadlineComputation {
  const nominalEnd = formatIsoDate(nominal);
  const expiresOn = formatIsoDate(shiftToWorkingDay(nominal));
  return {
    expiresOn,
    nominalEnd,
    augustDaysSkipped,
    shifted: expiresOn !== nominalEnd,
  };
}

export function computeLegalDays(
  start: string,
  days: number
): LegalDeadlineComputation {
  let result = parseIsoDate(start, 'deadline start');
  let counted = 0;
  let augustDaysSkipped = 0;
  while (counted < days) {
    result = addUtcDays(result, 1);
    if (isAugust(result)) {
      augustDaysSkipped++;
    } else {
      counted++;
    }
  }
  return finishComputation(result, augustDaysSkipped);
}

export function addLegalDays(start: string, days: number): string {
  return computeLegalDays(start, days).expiresOn;
}

function addCalendarMonth(date: Date): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetFirst = new Date(Date.UTC(year, month + 1, 1));
  const targetLast = new Date(
    Date.UTC(
      targetFirst.getUTCFullYear(),
      targetFirst.getUTCMonth() + 1,
      0
    )
  );
  return new Date(
    Date.UTC(
      targetFirst.getUTCFullYear(),
      targetFirst.getUTCMonth(),
      Math.min(day, targetLast.getUTCDate())
    )
  );
}

export function computeLegalMonth(start: string): LegalDeadlineComputation {
  const startDate = parseIsoDate(start, 'deadline start');
  let result = addCalendarMonth(startDate);
  let cursor = addUtcDays(startDate, 1);
  let countedUntil = result;
  let augustDaysSkipped = 0;

  while (cursor <= countedUntil) {
    if (isAugust(cursor)) {
      result = addUtcDays(result, 1);
      augustDaysSkipped++;
    }
    cursor = addUtcDays(cursor, 1);
    if (cursor > countedUntil && countedUntil < result) {
      countedUntil = result;
    }
  }

  return finishComputation(result, augustDaysSkipped);
}

export function addLegalMonth(start: string): string {
  return computeLegalMonth(start).expiresOn;
}

export function addCalendarDays(start: string, days: number): string {
  return formatIsoDate(addUtcDays(parseIsoDate(start, 'date'), days));
}

export function addCalendarYears(start: string, years: number): string {
  const date = parseIsoDate(start, 'date');
  const targetYear = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
  return formatIsoDate(
    new Date(Date.UTC(targetYear, month, Math.min(day, lastDay)))
  );
}

export function maxDate(values: string[]): string {
  return [...values].sort().at(-1) as string;
}
