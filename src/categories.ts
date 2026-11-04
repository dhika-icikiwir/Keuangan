import { TxType } from './types';

export interface Category {
  key: string;
  label: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { key: 'makan', label: 'Makan & Minum', icon: '🍜', color: '#F97316' },
  { key: 'transport', label: 'Transportasi', icon: '🛵', color: '#3B82F6' },
  { key: 'belanja', label: 'Belanja', icon: '🛒', color: '#EC4899' },
  { key: 'tagihan', label: 'Tagihan', icon: '💡', color: '#EAB308' },
  { key: 'pulsa', label: 'Pulsa & Internet', icon: '📱', color: '#8B5CF6' },
  { key: 'kesehatan', label: 'Kesehatan', icon: '💊', color: '#EF4444' },
  { key: 'hiburan', label: 'Hiburan', icon: '🎬', color: '#14B8A6' },
  { key: 'pendidikan', label: 'Pendidikan', icon: '📚', color: '#6366F1' },
  { key: 'rumah', label: 'Rumah', icon: '🏠', color: '#84CC16' },
  { key: 'lainnya', label: 'Lainnya', icon: '📦', color: '#64748B' },
];

export const INCOME_CATEGORIES: Category[] = [
  { key: 'gaji', label: 'Gaji', icon: '💼', color: '#16A34A' },
  { key: 'bonus', label: 'Bonus', icon: '🎁', color: '#0EA5E9' },
  { key: 'usaha', label: 'Usaha', icon: '🏪', color: '#F59E0B' },
  { key: 'freelance', label: 'Freelance', icon: '💻', color: '#8B5CF6' },
  { key: 'investasi', label: 'Investasi', icon: '📈', color: '#10B981' },
  { key: 'hadiah', label: 'Hadiah', icon: '🎉', color: '#EC4899' },
  { key: 'lainnya_in', label: 'Lainnya', icon: '💰', color: '#64748B' },
];

export function categoriesFor(type: TxType): Category[] {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

const ALL = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategory(key: string): Category {
  return ALL.find((c) => c.key === key) ?? { key, label: key, icon: '📦', color: '#64748B' };
}
