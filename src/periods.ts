import {
  addDays, addMonths, BULAN_PENDEK, dayInMonth, formatDayMonth, formatMonth, HARI_PENDEK_SENIN,
  monthKeyOf, weekdayMonFirst,
} from './format';
import { Transaction } from './types';

export type PeriodKind = 'week' | 'month' | 'year';

export interface Period {
  start: string;
  end: string;
  /** Untuk judul, misalnya "November 2026" atau "25 Okt - 24 Nov 2026" */
  label: string;
  /** Untuk kalimat pembanding, misalnya "Oktober" atau "minggu lalu" */
  compareLabel: string;
}

/**
 * Periode bulanan mengikuti tanggal mulai siklus (misalnya tanggal gajian).
 * Bulan "2026-11" dengan mulai tanggal 25 berarti 25 Nov sampai 24 Des.
 */
export function cycleMonthOf(dateKey: string, startDay: number): string {
  const day = Number(dateKey.slice(8, 10));
  const month = monthKeyOf(dateKey);
  return day >= startDay ? month : addMonths(month, -1);
}

export function cycleRange(monthKey: string, startDay: number): Period {
  if (startDay <= 1) {
    return {
      start: `${monthKey}-01`,
      end: dayInMonth(monthKey, 31),
      label: formatMonth(monthKey),
      compareLabel: formatMonth(monthKey).split(' ')[0],
    };
  }
  const start = dayInMonth(monthKey, startDay);
  const end = addDays(dayInMonth(addMonths(monthKey, 1), startDay), -1);
  return {
    start,
    end,
    label: `${formatDayMonth(start)} - ${formatDayMonth(end)} ${end.slice(0, 4)}`,
    compareLabel: 'periode sebelumnya',
  };
}

export function weekRange(dateKey: string): Period {
  const start = addDays(dateKey, -weekdayMonFirst(dateKey));
  const end = addDays(start, 6);
  return {
    start,
    end,
    label: `${formatDayMonth(start)} - ${formatDayMonth(end)} ${end.slice(0, 4)}`,
    compareLabel: 'minggu lalu',
  };
}

export function yearRange(year: number): Period {
  return { start: `${year}-01-01`, end: `${year}-12-31`, label: `${year}`, compareLabel: `${year - 1}` };
}

export function periodOf(kind: PeriodKind, anchor: string, startDay: number): Period {
  if (kind === 'week') return weekRange(anchor);
  if (kind === 'year') return yearRange(Number(anchor.slice(0, 4)));
  return cycleRange(cycleMonthOf(anchor, startDay), startDay);
}

/** Geser tanggal acuan satu periode ke depan atau ke belakang. */
export function shiftAnchor(kind: PeriodKind, anchor: string, n: number, startDay: number): string {
  if (kind === 'week') return addDays(anchor, 7 * n);
  if (kind === 'year') return `${Number(anchor.slice(0, 4)) + n}-01-01`;
  return cycleRange(addMonths(cycleMonthOf(anchor, startDay), n), startDay).start;
}

export function inPeriod(t: Transaction, p: Period): boolean {
  return t.date >= p.start && t.date <= p.end;
}

export interface Bucket {
  label: string;
  longLabel: string;
  start: string;
  end: string;
}

/** Pembagian periode untuk grafik tren: per hari (minggu), per 7 hari (bulan), per bulan (tahun). */
export function bucketsOf(kind: PeriodKind, p: Period): Bucket[] {
  if (kind === 'week') {
    return HARI_PENDEK_SENIN.map((label, i) => {
      const d = addDays(p.start, i);
      return { label, longLabel: `${label}, ${formatDayMonth(d)}`, start: d, end: d };
    });
  }
  if (kind === 'year') {
    const y = p.start.slice(0, 4);
    return BULAN_PENDEK.map((label, i) => {
      const m = `${y}-${i < 9 ? '0' : ''}${i + 1}`;
      return { label: label[0], longLabel: label, start: `${m}-01`, end: dayInMonth(m, 31) };
    });
  }
  const out: Bucket[] = [];
  let start = p.start;
  let i = 1;
  while (start <= p.end) {
    const endCandidate = addDays(start, 6);
    const end = endCandidate > p.end ? p.end : endCandidate;
    out.push({
      label: `Mg ${i}`,
      longLabel: `Minggu ${i} (${formatDayMonth(start)} - ${formatDayMonth(end)})`,
      start,
      end,
    });
    start = addDays(end, 1);
    i++;
  }
  return out;
}
