import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { findCategory } from '../categories';
import { Card, ChangeNote, Divider, Empty, Icon, Navigator, Screen, TxRow } from '../components/ui';
import { addDays, formatDayHeader, formatRupiah, percentChange, todayKey } from '../format';
import { cycleMonthOf, cycleRange, inPeriod, shiftAnchor } from '../periods';
import { useStore } from '../store';
import { amountText, Colors, F, MIN_TAP, useColors, useStyles } from '../theme';
import { Transaction, TxType } from '../types';

type Filter = 'all' | TxType;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'expense', label: 'Pengeluaran' },
  { value: 'income', label: 'Pemasukan' },
];

export default function TransactionsScreen({ onEdit }: { onEdit: (tx: Transaction) => void }) {
  const { transactions, settings, categories } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [anchor, setAnchor] = useState(todayKey());
  const startDay = settings.cycleStartDay;
  const period = cycleRange(cycleMonthOf(anchor, startDay), startDay);
  const prevPeriod = cycleRange(cycleMonthOf(addDays(period.start, -1), startDay), startDay);

  const inCur = useMemo(() => transactions.filter((t) => inPeriod(t, period)), [transactions, period.start]);

  const q = query.trim().toLowerCase();
  const visible = inCur.filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (!q) return true;
    const cat = findCategory(categories, t.category);
    return `${t.note} ${cat.label} ${t.amount}`.toLowerCase().includes(q);
  });

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of visible) map.set(t.date, [...(map.get(t.date) ?? []), t]);
    return [...map.entries()];
  }, [visible]);

  const totalType: TxType = filter === 'income' ? 'income' : 'expense';
  const sumType = (list: Transaction[]) => list.filter((t) => t.type === totalType).reduce((a, t) => a + t.amount, 0);
  const total = sumType(inCur);
  const prevTotal = sumType(transactions.filter((t) => inPeriod(t, prevPeriod)));

  return (
    <Screen>
      <View style={s.search}>
        <Icon name="search" size={22} color={c.subtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cari catatan, kategori, atau nominal"
          placeholderTextColor={c.subtle}
          style={s.searchInput}
          accessibilityLabel="Cari transaksi"
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} style={({ pressed }) => [s.clearBtn, pressed && s.pressed]}
            accessibilityRole="button" accessibilityLabel="Bersihkan pencarian">
            <Icon name="close" size={18} color={c.muted} />
          </Pressable>
        ) : null}
      </View>

      <View style={s.chips} accessibilityRole="radiogroup" accessibilityLabel="Jenis transaksi">
        {FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <Pressable key={f.value} onPress={() => setFilter(f.value)}
              style={({ pressed }) => [s.chip, active && s.chipActive, pressed && !active && s.pressed]}
              accessibilityRole="radio" aria-checked={active} accessibilityLabel={f.label}>
              <Text style={[s.chipText, active && s.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ gap: 12 }}>
        <Navigator
          label={period.label}
          prevLabel="Periode sebelumnya"
          nextLabel="Periode berikutnya"
          onPrev={() => setAnchor(shiftAnchor('month', anchor, -1, startDay))}
          onNext={() => setAnchor(shiftAnchor('month', anchor, 1, startDay))}
        />
        <View>
          <Text style={s.totalLabel}>Total {totalType === 'income' ? 'pemasukan' : 'pengeluaran'} periode ini</Text>
          <Text style={[s.totalValue, totalType === 'income' && { color: c.income }]}>{formatRupiah(total)}</Text>
          <ChangeNote pct={percentChange(total, prevTotal)} goodWhenDown={totalType === 'expense'} compareLabel={prevPeriod.compareLabel} />
        </View>
      </Card>

      {groups.length === 0 ? (
        <Card>
          <Empty
            icon="receipt-long"
            title="Tidak ada transaksi"
            text={inCur.length === 0
              ? 'Belum ada catatan di periode ini. Ketuk Catat Baru untuk menambah, atau pindah ke periode lain.'
              : 'Tidak ada yang cocok. Coba kata kunci lain atau ganti filter.'}
          />
        </Card>
      ) : groups.map(([date, list]) => (
        <View key={date} style={{ gap: 8 }}>
          <View style={s.groupHeader}>
            <Text style={s.groupTitle} accessibilityRole="header">{formatDayHeader(date)}</Text>
            <Text style={s.groupCount}>{list.length} transaksi</Text>
          </View>
          <Card style={s.listCard}>
            {list.map((t, i) => (
              <View key={t.id}>
                {i > 0 && <Divider />}
                <TxRow tx={t} onPress={() => onEdit(t)} />
              </View>
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  pressed: { backgroundColor: c.pressed },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.card, borderRadius: 14,
    borderWidth: 1, borderColor: c.control, paddingLeft: 14, paddingRight: 4, minHeight: 52,
  },
  searchInput: { flex: 1, fontFamily: F.regular, fontSize: 15, color: c.text, paddingVertical: 12 },
  clearBtn: { width: MIN_TAP, height: MIN_TAP, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { minHeight: MIN_TAP, paddingHorizontal: 16, borderRadius: 22, backgroundColor: c.container, justifyContent: 'center' },
  chipActive: { backgroundColor: c.primary },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: c.muted },
  chipTextActive: { color: c.onPrimary },
  totalLabel: { fontFamily: F.medium, fontSize: 13, color: c.muted },
  totalValue: { fontFamily: F.bold, fontSize: 24, color: c.text, marginVertical: 2, ...amountText },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  groupTitle: { fontFamily: F.bold, fontSize: 14, color: c.muted },
  groupCount: { fontFamily: F.medium, fontSize: 13, color: c.subtle },
  listCard: { padding: 0, paddingVertical: 4, overflow: 'hidden' },
});
