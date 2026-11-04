import React, { useMemo } from 'react';
import { Card, Empty, LineItem, Navigator, Screen, SectionTitle, SummaryRow, Total, TxItem } from '../components/ui';
import { addDays, formatRupiah, relativeDayLabel, todayKey } from '../format';
import { sumBy, useStore } from '../store';
import { Transaction } from '../types';

interface Props {
  date: string;
  setDate: (d: string) => void;
  onEdit: (tx: Transaction) => void;
}

export default function DailyScreen({ date, setDate, onEdit }: Props) {
  const { transactions } = useStore();
  const list = useMemo(() => transactions.filter((t) => t.date === date), [transactions, date]);
  const sum = sumBy(list);

  // Tujuh hari yang berakhir di tanggal yang dipilih, termasuk hari tanpa pengeluaran.
  const avg7 = useMemo(() => {
    const start = addDays(date, -6);
    const total = transactions
      .filter((t) => t.type === 'expense' && t.date >= start && t.date <= date)
      .reduce((a, t) => a + t.amount, 0);
    return total / 7;
  }, [transactions, date]);

  return (
    <Screen>
      <Navigator
        label={relativeDayLabel(date)}
        prevLabel="Hari sebelumnya"
        nextLabel="Hari berikutnya"
        resetHint="Ketuk untuk kembali ke hari ini"
        onPrev={() => setDate(addDays(date, -1))}
        onNext={() => setDate(addDays(date, 1))}
        onReset={() => setDate(todayKey())}
      />

      <Card>
        <Total label="Selisih hari ini" value={sum.balance} />
        <SummaryRow income={sum.income} expense={sum.expense} />
      </Card>

      <Card>
        <SectionTitle>{`Catatan (${list.length})`}</SectionTitle>
        {list.length === 0 ? (
          <Empty text="Tidak ada catatan di tanggal ini." action="Ketuk Catat untuk menambah transaksi di tanggal ini." />
        ) : (
          list.map((t) => <TxItem key={t.id} tx={t} onPress={() => onEdit(t)} />)
        )}
        <LineItem label="Rata-rata pengeluaran 7 hari terakhir" value={formatRupiah(avg7)} />
      </Card>
    </Screen>
  );
}
