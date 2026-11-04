import { TxType } from './types';

export interface Category {
  key: string;
  label: string;
  icon: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { key: 'makan', label: 'Makan & Minum', icon: '🍜' },
  { key: 'transport', label: 'Transportasi', icon: '🛵' },
  { key: 'belanja', label: 'Belanja', icon: '🛒' },
  { key: 'tagihan', label: 'Tagihan', icon: '💡' },
  { key: 'pulsa', label: 'Pulsa & Internet', icon: '📱' },
  { key: 'kesehatan', label: 'Kesehatan', icon: '💊' },
  { key: 'hiburan', label: 'Hiburan', icon: '🎬' },
  { key: 'pendidikan', label: 'Pendidikan', icon: '📚' },
  { key: 'rumah', label: 'Rumah', icon: '🏠' },
  { key: 'lainnya', label: 'Lainnya', icon: '📦' },
];

export const INCOME_CATEGORIES: Category[] = [
  { key: 'gaji', label: 'Gaji', icon: '💼' },
  { key: 'bonus', label: 'Bonus', icon: '🎁' },
  { key: 'usaha', label: 'Usaha', icon: '🏪' },
  { key: 'freelance', label: 'Freelance', icon: '💻' },
  { key: 'investasi', label: 'Investasi', icon: '📈' },
  { key: 'hadiah', label: 'Hadiah', icon: '🎉' },
  { key: 'lainnya_in', label: 'Lainnya', icon: '💰' },
];

export function categoriesFor(type: TxType): Category[] {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

const ALL = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategory(key: string): Category {
  return ALL.find((c) => c.key === key) ?? { key, label: key, icon: '📦' };
}
