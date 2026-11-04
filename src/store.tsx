import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Transaction } from './types';

const STORAGE_KEY = '@keuangan/transactions/v1';

type Status = 'loading' | 'ready' | 'loadError';

interface StoreValue {
  status: Status;
  saveError: boolean;
  transactions: Transaction[];
  save: (tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  remove: (id: string) => void;
  reload: () => void;
  retrySave: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function sortTx(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1,
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [saveError, setSaveError] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const dirty = useRef(false);

  const load = useCallback(() => {
    setStatus('loading');
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) throw new Error('format data tidak dikenal');
        setTransactions(sortTx(parsed));
        setStatus('ready');
      })
      // Saat gagal dimuat, penyimpanan dikunci supaya data lama di HP tidak tertimpa daftar kosong.
      .catch(() => setStatus('loadError'));
  }, []);

  useEffect(load, [load]);

  const persist = useCallback((list: Transaction[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, []);

  useEffect(() => {
    if (status !== 'ready' || !dirty.current) return;
    dirty.current = false;
    persist(transactions);
  }, [transactions, status, persist]);

  const save: StoreValue['save'] = useCallback((tx) => {
    dirty.current = true;
    setTransactions((prev) => {
      if (tx.id && prev.some((p) => p.id === tx.id)) {
        return sortTx(prev.map((p) => (p.id === tx.id ? { ...p, ...tx, id: p.id } : p)));
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return sortTx([...prev, { ...tx, id, createdAt: Date.now() }]);
    });
  }, []);

  const remove = useCallback((id: string) => {
    dirty.current = true;
    setTransactions((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const retrySave = useCallback(() => persist(transactions), [persist, transactions]);

  const value = useMemo(
    () => ({ status, saveError, transactions, save, remove, reload: load, retrySave }),
    [status, saveError, transactions, save, remove, load, retrySave],
  );
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
