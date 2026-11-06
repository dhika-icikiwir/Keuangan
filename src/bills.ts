import { addMonths, dayInMonth, diffDays, formatDayMonth, monthKeyOf } from './format';
import { Bill, Transaction } from './types';

export interface BillStatus {
  paid: boolean;
  nextDue: string;
  daysLeft: number;
  label: string;
  urgent: boolean;
}

/** Lunas hanya dihitung bila transaksi pembayarannya masih ada, jadi menghapus transaksi itu membatalkan status lunas. */
export function billStatus(b: Bill, transactions: Transaction[], today: string): BillStatus {
  const month = monthKeyOf(today);
  const paid = b.paid?.month === month && transactions.some((t) => t.id === b.paid!.txId);
  const nextDue = dayInMonth(paid ? addMonths(month, 1) : month, b.dueDay);
  const daysLeft = diffDays(nextDue, today);
  let label: string;
  if (paid) label = `Lunas bulan ini. Berikutnya ${formatDayMonth(nextDue)}`;
  else if (daysLeft > 1) label = `Jatuh tempo ${daysLeft} hari lagi`;
  else if (daysLeft === 1) label = 'Jatuh tempo besok';
  else if (daysLeft === 0) label = 'Jatuh tempo hari ini';
  else label = `Lewat ${-daysLeft} hari`;
  return { paid, nextDue, daysLeft, label, urgent: !paid && daysLeft <= 3 };
}
