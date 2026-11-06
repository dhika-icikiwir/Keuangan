const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const HARI_PENDEK_SENIN = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
export const BULAN_PENDEK = BULAN.map((b) => b.slice(0, 3));

export function formatRupiah(n: number): string {
  const sign = n < 0 ? '-' : '';
  const s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp ${s}`;
}

/** Bentuk ringkas untuk label grafik: 1.900.000 -> "1,9 jt" */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const fmt = (v: number) => (Math.round(v * 10) / 10).toString().replace('.', ',');
  if (abs >= 1e9) return `${fmt(n / 1e9)} M`;
  if (abs >= 1e6) return `${fmt(n / 1e6)} jt`;
  if (abs >= 1e3) return `${Math.round(n / 1e3)} rb`;
  return `${Math.round(n)}`;
}

/** Format angka untuk input (tanpa "Rp"), contoh 1500000 -> "1.500.000" */
export function formatNumberInput(digits: string): string {
  const clean = digits.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseNumberInput(text: string): number {
  return Number(text.replace(/\D/g, '')) || 0;
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

export function diffDays(a: string, b: string): number {
  return Math.round((fromDateKey(a).getTime() - fromDateKey(b).getTime()) / 86400000);
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

/** Tanggal ke-`day` di bulan itu, dipotong ke hari terakhir bila bulannya lebih pendek. */
export function dayInMonth(monthKey: string, day: number): string {
  return `${monthKey}-${pad(Math.min(day, daysInMonth(monthKey)))}`;
}

/** Senin = 0 ... Minggu = 6 */
export function weekdayMonFirst(key: string): number {
  return (fromDateKey(key).getDay() + 6) % 7;
}

export function formatLongDate(key: string): string {
  const d = fromDateKey(key);
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDate(key: string): string {
  const d = fromDateKey(key);
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDayMonth(key: string): string {
  const d = fromDateKey(key);
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]}`;
}

export function formatMonth(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  return `${BULAN[m - 1]} ${y}`;
}

export function monthName(monthKey: string): string {
  return BULAN[Number(monthKey.slice(5, 7)) - 1];
}

/** "Hari ini, 6 Nov 2026", "Kemarin, 5 Nov 2026", atau "4 Nov 2026" */
export function formatDayHeader(key: string): string {
  const t = todayKey();
  if (key === t) return `Hari ini, ${formatDate(key)}`;
  if (key === addDays(t, -1)) return `Kemarin, ${formatDate(key)}`;
  return formatDate(key);
}

export function relativeDayLabel(key: string): string {
  const t = todayKey();
  if (key === t) return 'Hari ini';
  if (key === addDays(t, -1)) return 'Kemarin';
  if (key === addDays(t, 1)) return 'Besok';
  return formatLongDate(key);
}

/** Persentase perubahan, atau null bila pembandingnya nol. */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  // Pembulatan tidak boleh menyiratkan "turun 100%" atau "sama" bila angkanya sebenarnya berbeda.
  if (pct <= -100 && current > 0) return -99;
  if (pct === 0 && current !== previous) return current > previous ? 1 : -1;
  return pct;
}

/** "Hari ini", "Kemarin", atau "4 Nov" untuk teks yang sempit */
export function shortDayLabel(key: string): string {
  const t = todayKey();
  if (key === t) return 'Hari ini';
  if (key === addDays(t, -1)) return 'Kemarin';
  return formatDayMonth(key);
}
