import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_CATEGORIES, FALLBACK_KEY } from './categories';
import { monthKeyOf, todayKey } from './format';
import { Bill, Category, Goal, Settings, Transaction } from './types';

const KEYS = {
  transactions: '@keuangan/transactions/v1',
  settings: '@keuangan/settings/v1',
  budgets: '@keuangan/budgets/v1',
  customCategories: '@keuangan/categories/v1',
  bills: '@keuangan/bills/v1',
  goals: '@keuangan/goals/v1',
} as const;

interface Data {
  transactions: Transaction[];
  settings: Settings;
  /** Batas pengeluaran per kategori per periode bulanan */
  budgets: Record<string, number>;
  customCategories: Category[];
  bills: Bill[];
  goals: Goal[];
}

type Key = keyof Data;

const EMPTY: Data = {
  transactions: [],
  settings: { hideBalance: false, cycleStartDay: 1 },
  budgets: {},
  customCategories: [],
  bills: [],
  goals: [],
};

type Status = 'loading' | 'ready' | 'loadError';

type TxInput = Omit<Transaction, 'id' | 'createdAt'> & { id?: string };

interface StoreValue extends Data {
  status: Status;
  saveError: boolean;
  categories: Category[];
  saveTx: (tx: TxInput) => string;
  removeTx: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setBudgets: (b: Record<string, number>) => void;
  saveCategory: (c: Category) => void;
  deleteCategory: (key: string) => void;
  saveBill: (b: Omit<Bill, 'id'> & { id?: string }) => void;
  removeBill: (id: string) => void;
  payBill: (b: Bill) => void;
  saveGoal: (g: Omit<Goal, 'id'> & { id?: string }) => void;
  removeGoal: (id: string) => void;
  reload: () => void;
  retrySave: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function sortTx(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1,
  );
}

function parse(key: Key, raw: string | null): Data[Key] {
  if (raw == null) return EMPTY[key];
  const v = JSON.parse(raw);
  const isArray = Array.isArray(EMPTY[key]);
  if (isArray !== Array.isArray(v) || typeof v !== 'object' || v === null) {
    throw new Error(`format ${key} tidak dikenal`);
  }
  if (key === 'settings') return { ...EMPTY.settings, ...v };
  if (key === 'transactions') return sortTx(v);
  return v;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [saveError, setSaveError] = useState(false);
  const [data, setData] = useState<Data>(EMPTY);
  const dirty = useRef(new Set<Key>());

  const load = useCallback(() => {
    setStatus('loading');
    const keys = Object.keys(KEYS) as Key[];
    AsyncStorage.multiGet(keys.map((k) => KEYS[k]))
      .then((pairs) => {
        const next = { ...EMPTY } as Record<Key, unknown>;
        keys.forEach((k, i) => { next[k] = parse(k, pairs[i][1]); });
        setData(next as unknown as Data);
        setStatus('ready');
      })
      // Saat gagal dimuat, penyimpanan dikunci supaya data lama di HP tidak tertimpa data kosong.
      .catch(() => setStatus('loadError'));
  }, []);

  useEffect(load, [load]);

  const persist = useCallback((keys: Key[], snapshot: Data) => {
    AsyncStorage.multiSet(keys.map((k) => [KEYS[k], JSON.stringify(snapshot[k])]))
      .then(() => setSaveError(false))
      .catch(() => {
        keys.forEach((k) => dirty.current.add(k));
        setSaveError(true);
      });
  }, []);

  useEffect(() => {
    if (status !== 'ready' || dirty.current.size === 0) return;
    const keys = [...dirty.current];
    dirty.current.clear();
    persist(keys, data);
  }, [data, status, persist]);

  const update = useCallback(<K extends Key>(key: K, fn: (prev: Data[K]) => Data[K]) => {
    dirty.current.add(key);
    setData((d) => ({ ...d, [key]: fn(d[key]) }));
  }, []);

  const saveTx = useCallback((tx: TxInput) => {
    const id = tx.id ?? newId();
    update('transactions', (prev) => {
      if (prev.some((p) => p.id === id)) {
        return sortTx(prev.map((p) => (p.id === id ? { ...p, ...tx, id } : p)));
      }
      return sortTx([...prev, { ...tx, id, createdAt: Date.now() }]);
    });
    return id;
  }, [update]);

  const removeTx = useCallback((id: string) => {
    update('transactions', (prev) => prev.filter((p) => p.id !== id));
  }, [update]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    update('settings', (prev) => ({ ...prev, ...patch }));
  }, [update]);

  const setBudgets = useCallback((b: Record<string, number>) => update('budgets', () => b), [update]);

  const saveCategory = useCallback((c: Category) => {
    update('customCategories', (prev) =>
      prev.some((p) => p.key === c.key) ? prev.map((p) => (p.key === c.key ? c : p)) : [...prev, c]);
  }, [update]);

  // Catatan, anggaran, dan tagihan yang memakai kategori ini dipindah ke "Lainnya" supaya tidak ada yang yatim.
  const deleteCategory = useCallback((key: string) => {
    setData((d) => {
      const cat = d.customCategories.find((c) => c.key === key);
      if (!cat) return d;
      const fallback = FALLBACK_KEY[cat.type];
      const { [key]: _removed, ...budgets } = d.budgets;
      (['customCategories', 'transactions', 'bills', 'budgets'] as Key[]).forEach((k) => dirty.current.add(k));
      return {
        ...d,
        customCategories: d.customCategories.filter((c) => c.key !== key),
        transactions: d.transactions.map((t) => (t.category === key ? { ...t, category: fallback } : t)),
        bills: d.bills.map((b) => (b.category === key ? { ...b, category: fallback } : b)),
        budgets,
      };
    });
  }, []);

  const saveBill = useCallback((b: Omit<Bill, 'id'> & { id?: string }) => {
    const id = b.id ?? newId();
    update('bills', (prev) =>
      prev.some((p) => p.id === id) ? prev.map((p) => (p.id === id ? { ...p, ...b, id } : p)) : [...prev, { ...b, id }]);
  }, [update]);

  const removeBill = useCallback((id: string) => update('bills', (prev) => prev.filter((p) => p.id !== id)), [update]);

  const payBill = useCallback((b: Bill) => {
    const date = todayKey();
    const txId = saveTx({ type: 'expense', amount: b.amount, category: b.category, note: b.name, date });
    update('bills', (prev) => prev.map((p) => (p.id === b.id ? { ...p, paid: { month: monthKeyOf(date), txId } } : p)));
  }, [saveTx, update]);

  const saveGoal = useCallback((g: Omit<Goal, 'id'> & { id?: string }) => {
    const id = g.id ?? newId();
    update('goals', (prev) =>
      prev.some((p) => p.id === id) ? prev.map((p) => (p.id === id ? { ...p, ...g, id } : p)) : [...prev, { ...g, id }]);
  }, [update]);

  const removeGoal = useCallback((id: string) => update('goals', (prev) => prev.filter((p) => p.id !== id)), [update]);

  const retrySave = useCallback(() => {
    const keys = Object.keys(KEYS) as Key[];
    dirty.current.clear();
    persist(keys, data);
  }, [persist, data]);

  const categories = useMemo(() => [...DEFAULT_CATEGORIES, ...data.customCategories], [data.customCategories]);

  const value = useMemo<StoreValue>(() => ({
    ...data, status, saveError, categories,
    saveTx, removeTx, updateSettings, setBudgets, saveCategory, deleteCategory,
    saveBill, removeBill, payBill, saveGoal, removeGoal, reload: load, retrySave,
  }), [data, status, saveError, categories, saveTx, removeTx, updateSettings, setBudgets, saveCategory,
    deleteCategory, saveBill, removeBill, payBill, saveGoal, removeGoal, load, retrySave]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore harus di dalam StoreProvider');
  return ctx;
}

export function sumBy(list: Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const t of list) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}
