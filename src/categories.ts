import { Category, TxType } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { key: 'makan', label: 'Makan & Minum', icon: 'restaurant', type: 'expense' },
  { key: 'transport', label: 'Transportasi', icon: 'directions-car', type: 'expense' },
  { key: 'belanja', label: 'Belanja', icon: 'shopping-bag', type: 'expense' },
  { key: 'tagihan', label: 'Tagihan', icon: 'receipt', type: 'expense' },
  { key: 'pulsa', label: 'Pulsa & Internet', icon: 'smartphone', type: 'expense' },
  { key: 'kesehatan', label: 'Kesehatan', icon: 'medical-services', type: 'expense' },
  { key: 'hiburan', label: 'Hiburan', icon: 'sports-esports', type: 'expense' },
  { key: 'pendidikan', label: 'Pendidikan', icon: 'school', type: 'expense' },
  { key: 'rumah', label: 'Rumah', icon: 'home', type: 'expense' },
  { key: 'lainnya', label: 'Lainnya', icon: 'more-horiz', type: 'expense' },
  { key: 'gaji', label: 'Gaji', icon: 'payments', type: 'income' },
  { key: 'bonus', label: 'Bonus', icon: 'redeem', type: 'income' },
  { key: 'usaha', label: 'Usaha', icon: 'storefront', type: 'income' },
  { key: 'freelance', label: 'Freelance', icon: 'laptop', type: 'income' },
  { key: 'investasi', label: 'Investasi', icon: 'show-chart', type: 'income' },
  { key: 'hadiah', label: 'Hadiah', icon: 'card-giftcard', type: 'income' },
  { key: 'lainnya_in', label: 'Lainnya', icon: 'more-horiz', type: 'income' },
];

export const FALLBACK_KEY: Record<TxType, string> = { expense: 'lainnya', income: 'lainnya_in' };

/** Ikon yang bisa dipilih untuk kategori buatan sendiri. */
export const CATEGORY_ICONS = [
  'restaurant', 'local-cafe', 'local-grocery-store', 'shopping-bag', 'directions-car', 'two-wheeler',
  'local-gas-station', 'flight', 'home', 'bolt', 'water-drop', 'wifi', 'smartphone', 'medical-services',
  'fitness-center', 'school', 'menu-book', 'child-care', 'pets', 'checkroom', 'sports-esports', 'theaters',
  'volunteer-activism', 'build', 'payments', 'work', 'storefront', 'savings', 'card-giftcard', 'sell',
];

export function findCategory(all: Category[], key: string): Category {
  return all.find((c) => c.key === key) ?? { key, label: 'Kategori terhapus', icon: 'more-horiz', type: 'expense' };
}
