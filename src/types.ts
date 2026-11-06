export type TxType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  note: string;
  /** Tanggal lokal dalam format YYYY-MM-DD */
  date: string;
  createdAt: number;
}

export interface Category {
  key: string;
  label: string;
  /** Nama ikon MaterialIcons */
  icon: string;
  type: TxType;
  custom?: boolean;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  /** Tanggal jatuh tempo tiap bulan, 1 sampai 31 (dipotong ke akhir bulan bila perlu) */
  dueDay: number;
  /** Pembayaran terakhir: bulan (YYYY-MM) dan transaksi yang mencatatnya */
  paid?: { month: string; txId: string };
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export interface Settings {
  hideBalance: boolean;
  /** Tanggal mulai periode bulanan, 1 sampai 28 */
  cycleStartDay: number;
}
