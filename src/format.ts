const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function formatRupiah(n: number): string {
  const sign = n < 0 ? '-' : '';
  const s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp ${s}`;
}

/** Format angka untuk input (tanpa "Rp"), contoh 1500000 -> "1.500.000" */
export function formatNumberInput(digits: string): string {
  const clean = digits.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(key: string, days: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** Kunci bulan YYYY-MM */
export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function addMonths(monthKey: string, n: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function formatLongDate(key: string): string {
  const d = fromDateKey(key);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(key: string): string {
  const d = fromDateKey(key);
  return `${HARI[d.getDay()].slice(0, 3)}, ${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)}`;
}

export function formatMonth(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${BULAN[m - 1]} ${y}`;
}

export function relativeDayLabel(key: string): string {
  const t = todayKey();
  if (key === t) return 'Hari ini';
  if (key === addDays(t, -1)) return 'Kemarin';
  if (key === addDays(t, 1)) return 'Besok';
  return formatLongDate(key);
}
