import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { Card, Empty, LineItem, Screen, SectionTitle, SummaryRow, Total, TxItem } from '../components/ui';
import { formatLongDate, formatMonth, formatRupiah, monthKeyOf, todayKey } from '../format';
import { sumBy, useStore } from '../store';
import { Colors, useColors, useStyles } from '../theme';
import { Transaction } from '../types';

export default function HomeScreen({ onEdit }: { onEdit: (tx: Transaction) => void }) {
  const { transactions } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const today = todayKey();
  const month = monthKeyOf(today);

  const all = useMemo(() => sumBy(transactions), [transactions]);
  const monthSum = useMemo(() => sumBy(transactions.filter((t) => monthKeyOf(t.date) === month)), [transactions, month]);
  const todaySum = useMemo(() => sumBy(transactions.filter((t) => t.date === today)), [transactions, today]);
  const recent = transactions.slice(0, 8);

  return (
    <Screen>
      <Text style={s.date}>{formatLongDate(today)}</Text>

      <Card>
        <Total label="Saldo semua catatan" value={all.balance} />
        <SummaryRow income={all.income} expense={all.expense} />
      </Card>

      <Card>
        <SectionTitle>Hari ini</SectionTitle>
        <LineItem label="Pemasukan" value={`+${formatRupiah(todaySum.income)}`} color={c.income} />
        <LineItem label="Pengeluaran" value={`-${formatRupiah(todaySum.expense)}`} color={c.expense} />
      </Card>

      <Card>
        <SectionTitle>{formatMonth(month)}</SectionTitle>
        <LineItem label="Pemasukan" value={`+${formatRupiah(monthSum.income)}`} color={c.income} />
        <LineItem label="Pengeluaran" value={`-${formatRupiah(monthSum.expense)}`} color={c.expense} />
        <LineItem
          label="Sisa bulan ini"
          value={formatRupiah(monthSum.balance)}
          color={monthSum.balance < 0 ? c.expense : c.text}
        />
      </Card>

      <Card>
        <SectionTitle>Catatan terakhir</SectionTitle>
        {recent.length === 0 ? (
          <Empty text="Belum ada catatan." action="Ketuk tombol Catat di bawah untuk mencatat pemasukan atau pengeluaran pertama." />
        ) : (
          recent.map((t) => <TxItem key={t.id} tx={t} onPress={() => onEdit(t)} showDate />)
        )}
      </Card>
    </Screen>
  );
}

const styles = (c: Colors) => ({
  date: { color: c.muted, fontWeight: '600', fontSize: 14, marginBottom: 12 },
}) as const;
