import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Empty, SectionTitle, SummaryRow, TxItem } from '../components/ui';
import { formatLongDate, formatMonth, formatRupiah, monthKeyOf, todayKey } from '../format';
import { sumBy, useStore } from '../store';
import { colors } from '../theme';
import { Transaction } from '../types';

export default function HomeScreen({ onEdit }: { onEdit: (tx: Transaction) => void }) {
  const { transactions } = useStore();
  const today = todayKey();
  const month = monthKeyOf(today);

  const all = useMemo(() => sumBy(transactions), [transactions]);
  const monthSum = useMemo(() => sumBy(transactions.filter((t) => monthKeyOf(t.date) === month)), [transactions, month]);
  const todaySum = useMemo(() => sumBy(transactions.filter((t) => t.date === today)), [transactions, today]);
  const recent = transactions.slice(0, 8);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greet}>{formatLongDate(today)}</Text>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Total Saldo</Text>
        <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>{formatRupiah(all.balance)}</Text>
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroSmallLabel}>Pemasukan</Text>
            <Text style={styles.heroSmall}>{formatRupiah(all.income)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroSmallLabel}>Pengeluaran</Text>
            <Text style={styles.heroSmall}>{formatRupiah(all.expense)}</Text>
          </View>
        </View>
      </View>

      <Card>
        <SectionTitle>Hari Ini</SectionTitle>
        <SummaryRow income={todaySum.income} expense={todaySum.expense} />
      </Card>

      <Card>
        <SectionTitle>Bulan {formatMonth(month)}</SectionTitle>
        <SummaryRow income={monthSum.income} expense={monthSum.expense} />
        <View style={styles.balanceLine}>
          <Text style={{ color: colors.muted, fontWeight: '600' }}>Sisa bulan ini</Text>
          <Text style={{ fontWeight: '800', color: monthSum.balance >= 0 ? colors.income : colors.expense }}>
            {formatRupiah(monthSum.balance)}
          </Text>
        </View>
      </Card>

      <Card>
        <SectionTitle>Transaksi Terakhir</SectionTitle>
        {recent.length === 0 ? (
          <Empty text={'Belum ada transaksi.\nTekan tombol + untuk mulai mencatat.'} />
        ) : (
          recent.map((t) => <TxItem key={t.id} tx={t} onPress={() => onEdit(t)} showDate />)
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 110 },
  greet: { color: colors.muted, fontWeight: '600', marginBottom: 10 },
  hero: { backgroundColor: colors.primary, borderRadius: 20, padding: 20, marginBottom: 14 },
  heroLabel: { color: '#DBEAFE', fontWeight: '600' },
  heroValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 6 },
  heroRow: { flexDirection: 'row', marginTop: 8 },
  heroSmallLabel: { color: '#BFDBFE', fontSize: 12 },
  heroSmall: { color: '#fff', fontWeight: '700', fontSize: 15, marginTop: 2 },
  balanceLine: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
});
