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
