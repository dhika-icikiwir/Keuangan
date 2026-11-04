import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getCategory } from '../categories';
import { Card, Empty, Navigator, SectionTitle, SummaryRow } from '../components/ui';
import {
  addMonths, daysInMonth, formatMonth, formatRupiah, formatShortDate, monthKeyOf, todayKey,
} from '../format';
import { sumBy, useStore } from '../store';
import { colors } from '../theme';
import { TxType } from '../types';

interface Props {
  month: string;
  setMonth: (m: string) => void;
  onOpenDay: (date: string) => void;
}

export default function MonthlyScreen({ month, setMonth, onOpenDay }: Props) {
  const { transactions } = useStore();
  const [breakdownType, setBreakdownType] = useState<TxType>('expense');

  const list = useMemo(() => transactions.filter((t) => monthKeyOf(t.date) === month), [transactions, month]);
  const sum = sumBy(list);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of list) if (t.type === breakdownType) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [list, breakdownType]);
  const breakdownTotal = byCategory.reduce((a, [, v]) => a + v, 0);

  const byDay = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of list) {
      const cur = map.get(t.date) ?? { income: 0, expense: 0 };
      cur[t.type] += t.amount;
      map.set(t.date, cur);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [list]);

  // Hitung rata-rata pengeluaran per hari (bulan berjalan: sampai hari ini)
  const today = todayKey();
  const daysCounted = monthKeyOf(today) === month ? Number(today.slice(8, 10)) : daysInMonth(month);
  const avgDaily = sum.expense / Math.max(1, daysCounted);

  // Grafik batang pengeluaran harian
  const dailyBars = useMemo(() => {
    const n = daysInMonth(month);
    const arr = new Array(n).fill(0);
    for (const t of list) if (t.type === 'expense') arr[Number(t.date.slice(8, 10)) - 1] += t.amount;
    return arr as number[];
  }, [list, month]);
  const maxBar = Math.max(1, ...dailyBars);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Navigator
        label={formatMonth(month)}
        onPrev={() => setMonth(addMonths(month, -1))}
        onNext={() => setMonth(addMonths(month, 1))}
        onLabelPress={() => setMonth(monthKeyOf(todayKey()))}
      />

      <Card>
        <SummaryRow income={sum.income} expense={sum.expense} />
        <View style={styles.line}>
          <Text style={styles.muted}>Sisa / Tabungan</Text>
          <Text style={{ fontWeight: '800', color: sum.balance >= 0 ? colors.income : colors.expense }}>
            {formatRupiah(sum.balance)}
          </Text>
        </View>
        <View style={[styles.line, { borderTopWidth: 0, paddingTop: 4, marginTop: 4 }]}>
          <Text style={styles.muted}>Rata-rata pengeluaran / hari</Text>
          <Text style={{ fontWeight: '700', color: colors.text }}>{formatRupiah(avgDaily)}</Text>
        </View>
      </Card>

      <Card>
        <SectionTitle>Pengeluaran Harian</SectionTitle>
        <View style={styles.chart}>
          {dailyBars.map((v, i) => (
            <View key={i} style={styles.barWrap}>
              <View style={[styles.bar, { height: `${(v / maxBar) * 100}%`, opacity: v ? 1 : 0.15, minHeight: 2 }]} />
            </View>
          ))}
        </View>
        <View style={styles.chartAxis}>
          <Text style={styles.axisText}>1</Text>
          <Text style={styles.axisText}>{Math.ceil(dailyBars.length / 2)}</Text>
          <Text style={styles.axisText}>{dailyBars.length}</Text>
        </View>
      </Card>

      <Card>
        <View style={styles.breakdownHeader}>
          <SectionTitle>Per Kategori</SectionTitle>
          <View style={styles.miniToggle}>
            {(['expense', 'income'] as TxType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setBreakdownType(t)}
                style={[styles.miniBtn, breakdownType === t && {
                  backgroundColor: t === 'expense' ? colors.expense : colors.income,
                }]}
              >
                <Text style={[styles.miniText, breakdownType === t && { color: '#fff' }]}>
                  {t === 'expense' ? 'Keluar' : 'Masuk'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {byCategory.length === 0 ? (
          <Empty text="Belum ada data di bulan ini." />
        ) : (
          byCategory.map(([key, value]) => {
            const cat = getCategory(key);
            const pct = breakdownTotal ? (value / breakdownTotal) * 100 : 0;
            return (
              <View key={key} style={{ marginBottom: 12 }}>
                <View style={styles.catRow}>
                  <Text style={styles.catLabel}>{cat.icon} {cat.label}</Text>
                  <Text style={styles.catValue}>{formatRupiah(value)} · {pct.toFixed(0)}%</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                </View>
              </View>
            );
          })
        )}
      </Card>

      <Card>
        <SectionTitle>Ringkasan Per Hari</SectionTitle>
        {byDay.length === 0 ? (
          <Empty text="Belum ada transaksi." />
        ) : (
          byDay.map(([date, v]) => (
            <Pressable key={date} onPress={() => onOpenDay(date)} style={({ pressed }) => [styles.dayRow, pressed && { opacity: 0.6 }]}>
              <Text style={styles.dayLabel}>{formatShortDate(date)}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                {v.income > 0 && <Text style={{ color: colors.income, fontWeight: '700' }}>+{formatRupiah(v.income)}</Text>}
                {v.expense > 0 && <Text style={{ color: colors.expense, fontWeight: '700' }}>-{formatRupiah(v.expense)}</Text>}
              </View>
            </Pressable>
          ))
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
  chart: { height: 110, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { backgroundColor: colors.expense, borderRadius: 3 },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisText: { fontSize: 11, color: colors.muted },
  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  miniToggle: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 10, padding: 3 },
  miniBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  miniText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catLabel: { fontWeight: '600', color: colors.text, flex: 1 },
  catValue: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  track: { height: 8, backgroundColor: colors.bg, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  dayRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  dayLabel: { fontWeight: '600', color: colors.text },
});
