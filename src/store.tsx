import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Transaction } from './types';

const STORAGE_KEY = '@keuangan/transactions/v1';

interface StoreValue {
  ready: boolean;
  transactions: Transaction[];
  save: (tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => void;
  remove: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function sortTx(list: Transaction[]): Transaction[] {
  return [...list].sort((a, b) =>
    a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1,
  );
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setTransactions(sortTx(JSON.parse(raw)));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((list: Transaction[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const save: StoreValue['save'] = useCallback(
    (tx) => {
      setTransactions((prev) => {
        let next: Transaction[];
        if (tx.id && prev.some((p) => p.id === tx.id)) {
          next = prev.map((p) => (p.id === tx.id ? { ...p, ...tx, id: p.id } : p));
        } else {
          const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          next = [...prev, { ...tx, id, createdAt: Date.now() }];
        }
        next = sortTx(next);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const remove = useCallback(
    (id: string) => {
      setTransactions((prev) => {
        const next = prev.filter((p) => p.id !== id);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo(() => ({ ready, transactions, save, remove }), [ready, transactions, save, remove]);
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
