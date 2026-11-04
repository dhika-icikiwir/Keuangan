import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Empty, Navigator, SectionTitle, SummaryRow, TxItem } from '../components/ui';
import { addDays, formatRupiah, relativeDayLabel, todayKey } from '../format';
import { sumBy, useStore } from '../store';
import { colors } from '../theme';
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

  // Rata-rata pengeluaran 7 hari terakhir (sampai tanggal yang dipilih)
  const avg7 = useMemo(() => {
    const start = addDays(date, -6);
    const total = transactions
      .filter((t) => t.type === 'expense' && t.date >= start && t.date <= date)
      .reduce((a, t) => a + t.amount, 0);
    return total / 7;
  }, [transactions, date]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Navigator
        label={relativeDayLabel(date)}
        onPrev={() => setDate(addDays(date, -1))}
        onNext={() => setDate(addDays(date, 1))}
        onLabelPress={() => setDate(todayKey())}
      />

      <Card>
        <SummaryRow income={sum.income} expense={sum.expense} />
        <View style={styles.line}>
          <Text style={styles.muted}>Selisih hari ini</Text>
          <Text style={{ fontWeight: '800', color: sum.balance >= 0 ? colors.income : colors.expense }}>
            {formatRupiah(sum.balance)}
          </Text>
        </View>
        <View style={[styles.line, { borderTopWidth: 0, paddingTop: 4, marginTop: 4 }]}>
          <Text style={styles.muted}>Rata-rata pengeluaran 7 hari</Text>
          <Text style={{ fontWeight: '700', color: colors.text }}>{formatRupiah(avg7)}</Text>
        </View>
      </Card>

      <Card>
        <SectionTitle>Daftar Transaksi ({list.length})</SectionTitle>
        {list.length === 0 ? (
          <Empty text="Tidak ada transaksi pada tanggal ini." />
        ) : (
          list.map((t) => <TxItem key={t.id} tx={t} onPress={() => onEdit(t)} />)
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 110 },
  muted: { color: colors.muted, fontWeight: '600' },
  line: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
});
