import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getCategory } from '../categories';
import { Card, Empty, LineItem, Navigator, Screen, Segmented, SectionTitle, SummaryRow, Total } from '../components/ui';
import {
  addMonths, daysInMonth, formatMonth, formatRupiah, formatShortDate, monthKeyOf, todayKey,
} from '../format';
import { sumBy, useStore } from '../store';
import { amountText, Colors, MIN_TAP, useColors, useStyles } from '../theme';
import { TxType } from '../types';

interface Props {
  month: string;
  setMonth: (m: string) => void;
  onOpenDay: (date: string) => void;
}

export default function MonthlyScreen({ month, setMonth, onOpenDay }: Props) {
  const { transactions } = useStore();
  const s = useStyles(styles);
  const c = useColors();
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

  const today = todayKey();
  const isCurrentMonth = monthKeyOf(today) === month;
  // Bulan berjalan dirata-rata sampai hari ini saja, supaya hari yang belum lewat tidak menurunkan angkanya.
  const daysCounted = isCurrentMonth ? Number(today.slice(8, 10)) : daysInMonth(month);
  const avgDaily = sum.expense / Math.max(1, daysCounted);

  const dailyBars = useMemo(() => {
    const arr: number[] = new Array(daysInMonth(month)).fill(0);
    for (const t of list) if (t.type === 'expense') arr[Number(t.date.slice(8, 10)) - 1] += t.amount;
    return arr;
  }, [list, month]);
  const maxBar = Math.max(...dailyBars);
  const peakDay = dailyBars.indexOf(maxBar) + 1;
  const peakKey = `${month}-${peakDay < 10 ? '0' : ''}${peakDay}`;
  const todayIndex = isCurrentMonth ? Number(today.slice(8, 10)) - 1 : -1;

  return (
    <Screen>
      <Navigator
        label={formatMonth(month)}
        prevLabel="Bulan sebelumnya"
        nextLabel="Bulan berikutnya"
        resetHint="Ketuk untuk kembali ke bulan ini"
        onPrev={() => setMonth(addMonths(month, -1))}
        onNext={() => setMonth(addMonths(month, 1))}
        onReset={() => setMonth(monthKeyOf(today))}
      />

      <Card>
        <Total label="Sisa bulan ini" value={sum.balance} />
        <SummaryRow income={sum.income} expense={sum.expense} />
        <View style={{ height: 12 }} />
        <LineItem label="Rata-rata pengeluaran per hari" value={formatRupiah(avgDaily)} />
      </Card>

      {sum.expense > 0 && (
        <Card>
          <SectionTitle>Pengeluaran per hari</SectionTitle>
          <Text style={s.chartNote}>
            Paling besar: {formatShortDate(peakKey)}, {formatRupiah(maxBar)}
          </Text>
          <View style={s.chart} accessible accessibilityLabel={`Grafik pengeluaran per hari. Paling besar ${formatShortDate(peakKey)}, ${formatRupiah(maxBar)}`}>
            {dailyBars.map((v, i) => (
              <View key={i} style={s.barWrap}>
                <View
                  style={[
                    s.bar,
                    { height: `${(v / maxBar) * 100}%` },
                    v === 0 && s.barEmpty,
                    i === todayIndex && s.barToday,
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={s.chartAxis}>
            <Text style={s.axisText}>1</Text>
            {todayIndex >= 0 && <Text style={s.axisText}>Batang bertepi: hari ini</Text>}
            <Text style={s.axisText}>{dailyBars.length}</Text>
          </View>
        </Card>
      )}

      <Card>
        <SectionTitle>Per kategori</SectionTitle>
        <Segmented
          label="Tampilkan kategori untuk"
          value={breakdownType}
          onChange={setBreakdownType}
          options={[
            { value: 'expense', label: 'Pengeluaran', activeColor: c.expense, activeText: c.onExpense },
            { value: 'income', label: 'Pemasukan', activeColor: c.income, activeText: c.onAccent },
          ]}
        />
        <View style={{ height: 12 }} />
        {byCategory.length === 0 ? (
          <Empty
            text={`Belum ada ${breakdownType === 'expense' ? 'pengeluaran' : 'pemasukan'} di bulan ini.`}
            action="Catatan baru akan dikelompokkan per kategori di sini."
          />
        ) : (
          byCategory.map(([key, value]) => {
            const cat = getCategory(key);
            const pct = breakdownTotal ? (value / breakdownTotal) * 100 : 0;
            return (
              <View key={key} style={s.catBlock} accessible accessibilityLabel={`${cat.label} ${formatRupiah(value)}, ${pct.toFixed(0)} persen`}>
                <View style={s.catRow}>
                  <Text style={s.catLabel}>{cat.icon} {cat.label}</Text>
                  <Text style={s.catValue}>{formatRupiah(value)}</Text>
                </View>
                <View style={s.catBarRow}>
                  <View style={s.track}>
                    <View style={[s.fill, { width: `${pct}%`, backgroundColor: breakdownType === 'expense' ? c.expense : c.income }]} />
                  </View>
                  <Text style={s.pct}>{pct.toFixed(0)}%</Text>
                </View>
              </View>
            );
          })
        )}
      </Card>

      <Card>
        <SectionTitle>Per hari</SectionTitle>
        {byDay.length === 0 ? (
          <Empty text="Belum ada catatan di bulan ini." action="Ketuk Catat untuk mulai mencatat." />
        ) : (
          byDay.map(([date, v]) => (
            <Pressable
              key={date}
              onPress={() => onOpenDay(date)}
              style={({ pressed }) => [s.dayRow, pressed && s.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`${formatShortDate(date)}, pemasukan ${formatRupiah(v.income)}, pengeluaran ${formatRupiah(v.expense)}`}
              accessibilityHint="Ketuk untuk membuka catatan hari ini di tab Harian"
            >
              <Text style={s.dayLabel}>{formatShortDate(date)}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                {v.income > 0 && <Text style={[s.dayAmount, { color: c.income }]}>+{formatRupiah(v.income)}</Text>}
                {v.expense > 0 && <Text style={[s.dayAmount, { color: c.expense }]}>-{formatRupiah(v.expense)}</Text>}
              </View>
            </Pressable>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = (c: Colors) => ({
  pressed: { backgroundColor: c.pressed },
  chartNote: { color: c.text, fontSize: 14, marginBottom: 12, ...amountText },
  chart: { height: 110, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { backgroundColor: c.expense, borderTopLeftRadius: 2, borderTopRightRadius: 2, minHeight: 2 },
  barEmpty: { backgroundColor: c.line },
  barToday: { borderWidth: 1.5, borderColor: c.text, minHeight: 6 },
  chartAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisText: { fontSize: 12, color: c.muted },
  catBlock: { paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, gap: 8 },
  catLabel: { fontWeight: '600', color: c.text, flex: 1, fontSize: 15 },
  catValue: { color: c.text, fontWeight: '700', fontSize: 15, ...amountText },
  catBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 6, backgroundColor: c.line, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { width: 40, textAlign: 'right', color: c.muted, fontSize: 13, ...amountText },
  dayRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: MIN_TAP + 8,
    paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line,
    marginHorizontal: -8, paddingHorizontal: 8,
  },
  dayLabel: { fontWeight: '600', color: c.text, fontSize: 15 },
  dayAmount: { fontWeight: '700', fontSize: 15, ...amountText },
}) as const;
