import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { billStatus } from '../bills';
import { findCategory } from '../categories';
import { Button, Card, Divider, Empty, IconCircle, Navigator, Screen, SectionHeader, TxRow } from '../components/ui';
import {
  addMonths, dayInMonth, daysInMonth, formatDate, formatDayHeader, formatMonth, formatRupiah, HARI_PENDEK_SENIN,
  monthKeyOf, todayKey, weekdayMonFirst,
} from '../format';
import { sumBy, useStore } from '../store';
import { amountText, Colors, F, useColors, useStyles } from '../theme';
import { Bill, Transaction } from '../types';

interface Props {
  selected: string;
  setSelected: (d: string) => void;
  onEdit: (tx: Transaction) => void;
  onAddOn: (date: string) => void;
  onEditBill: (bill: Bill | null) => void;
}

export default function CalendarScreen({ selected, setSelected, onEdit, onAddOn, onEditBill }: Props) {
  const { transactions, bills, categories, payBill } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const today = todayKey();
  const month = monthKeyOf(selected);

  const monthList = useMemo(() => transactions.filter((t) => monthKeyOf(t.date) === month), [transactions, month]);
  const monthSum = sumBy(monthList);

  const perDay = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of monthList) {
      const cur = map.get(t.date) ?? { income: 0, expense: 0 };
      cur[t.type] += t.amount;
      map.set(t.date, cur);
    }
    return map;
  }, [monthList]);

  const billsByDay = new Map<string, string[]>();
  for (const b of bills) {
    const d = dayInMonth(month, b.dueDay);
    billsByDay.set(d, [...(billsByDay.get(d) ?? []), b.name]);
  }

  const lead = weekdayMonFirst(`${month}-01`);
  const n = daysInMonth(month);
  const cells: (string | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: n }, (_, i) => `${month}-${i < 9 ? '0' : ''}${i + 1}`),
  ];
  while (cells.length % 7) cells.push(null);

  const dayList = transactions.filter((t) => t.date === selected);
  const daySum = sumBy(dayList);

  const sortedBills = bills
    .map((b) => ({ b, st: billStatus(b, transactions, today) }))
    .sort((x, y) => (x.st.paid === y.st.paid ? x.st.nextDue.localeCompare(y.st.nextDue) : x.st.paid ? 1 : -1));

  const goMonth = (delta: number) => {
    const m = addMonths(month, delta);
    setSelected(m === monthKeyOf(today) ? today : `${m}-01`);
  };

  const confirmPay = (b: Bill) => {
    Alert.alert(
      `Tandai ${b.name} lunas?`,
      `${formatRupiah(b.amount)} akan dicatat sebagai pengeluaran hari ini.`,
      [{ text: 'Batal', style: 'cancel' }, { text: 'Tandai lunas', onPress: () => payBill(b) }],
    );
  };

  return (
    <Screen>
      <Card style={{ gap: 12 }}>
        <Navigator label={formatMonth(month)} prevLabel="Bulan sebelumnya" nextLabel="Bulan berikutnya"
          onPrev={() => goMonth(-1)} onNext={() => goMonth(1)} />
        <View style={s.duo}>
          <View style={s.duoBox} accessible accessibilityLabel={`Pemasukan ${formatMonth(month)} ${formatRupiah(monthSum.income)}`}>
            <Text style={s.duoLabel}>Pemasukan</Text>
            <Text style={[s.duoValue, { color: c.income }]} numberOfLines={1} adjustsFontSizeToFit>{formatRupiah(monthSum.income)}</Text>
          </View>
          <View style={s.duoBox} accessible accessibilityLabel={`Pengeluaran ${formatMonth(month)} ${formatRupiah(monthSum.expense)}`}>
            <Text style={s.duoLabel}>Pengeluaran</Text>
            <Text style={[s.duoValue, { color: c.expense }]} numberOfLines={1} adjustsFontSizeToFit>{formatRupiah(monthSum.expense)}</Text>
          </View>
        </View>
      </Card>

      <Card style={s.gridCard}>
        <View style={s.weekRow}>
          {HARI_PENDEK_SENIN.map((h, i) => (
            <Text key={h} style={[s.weekday, i === 6 && { color: c.expense }]}>{h}</Text>
          ))}
        </View>
        <View style={s.grid}>
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={s.cell} />;
            const info = perDay.get(d);
            const dueBills = billsByDay.get(d);
            const isSel = d === selected;
            const isToday = d === today;
            const parts = [formatDayHeader(d)];
            if (info?.income) parts.push(`pemasukan ${formatRupiah(info.income)}`);
            if (info?.expense) parts.push(`pengeluaran ${formatRupiah(info.expense)}`);
            if (dueBills) parts.push(`tagihan ${dueBills.join(', ')}`);
            return (
              <Pressable key={d} onPress={() => setSelected(d)} style={s.cell}
                accessibilityRole="button" aria-selected={isSel} accessibilityLabel={parts.join(', ')}>
                <View style={[s.dayCircle, isToday && !isSel && s.todayRing, isSel && s.selCircle]}>
                  <Text style={[s.dayNum, (isToday || isSel) && { fontFamily: F.bold }, isToday && !isSel && { color: c.primary }, isSel && { color: c.onPrimary }]}>
                    {Number(d.slice(8, 10))}
                  </Text>
                </View>
                <View style={s.markers}>
                  {info?.income ? <View style={[s.dot, { backgroundColor: c.income }]} /> : null}
                  {info?.expense ? <View style={[s.square, { backgroundColor: c.expense }]} /> : null}
                  {dueBills ? <View style={[s.ring, { borderColor: c.text }]} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={s.legend}>
          <View style={s.legendItem}><View style={[s.dot, { backgroundColor: c.income }]} /><Text style={s.legendText}>Pemasukan</Text></View>
          <View style={s.legendItem}><View style={[s.square, { backgroundColor: c.expense }]} /><Text style={s.legendText}>Pengeluaran</Text></View>
          <View style={s.legendItem}><View style={[s.ring, { borderColor: c.text }]} /><Text style={s.legendText}>Tagihan</Text></View>
        </View>
      </Card>

      <Card style={s.listCard}>
        <View style={s.dayHead}>
          <Text style={s.dayTitle} accessibilityRole="header">{formatDayHeader(selected)}</Text>
          <Text style={s.dayCount}>{dayList.length} transaksi</Text>
        </View>
        {dayList.length > 0 && (
          <View style={s.dayTotals}>
            {daySum.income > 0 && <Text style={[s.dayTotal, { color: c.income }]}>+{formatRupiah(daySum.income)}</Text>}
            {daySum.expense > 0 && <Text style={[s.dayTotal, { color: c.expense }]}>-{formatRupiah(daySum.expense)}</Text>}
          </View>
        )}
        {dayList.length === 0 ? (
          <Empty icon="event-note" title="Tidak ada catatan" text={`Belum ada transaksi pada ${formatDate(selected)}.`}
            action="Catat di tanggal ini" onAction={() => onAddOn(selected)} />
        ) : dayList.map((t, i) => (
          <View key={t.id}>
            {i > 0 && <Divider />}
            <TxRow tx={t} onPress={() => onEdit(t)} />
          </View>
        ))}
      </Card>

      <View>
        <SectionHeader title="Tagihan rutin" />
        <Card style={{ gap: 12 }}>
          {sortedBills.length === 0 ? (
            <Empty icon="event-repeat" title="Belum ada tagihan rutin"
              text="Catat tagihan bulanan seperti listrik, internet, atau kos supaya tanggal jatuh temponya muncul di kalender." />
          ) : sortedBills.map(({ b, st }) => {
            const cat = findCategory(categories, b.category);
            return (
              <View key={b.id} style={s.bill}>
                <View style={s.billTop}>
                  <IconCircle name={cat.icon} size={40} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.billName} numberOfLines={1}>{b.name}</Text>
                    <Text style={s.billDate}>Tiap tanggal {b.dueDay}. Berikutnya {formatDate(st.nextDue)}</Text>
                  </View>
                  <Text style={s.billAmount}>{formatRupiah(b.amount)}</Text>
                </View>
                <View style={[s.status, st.urgent && { backgroundColor: c.errorBg }, st.paid && { backgroundColor: c.iconBg }]}>
                  <Text style={[s.statusText, st.urgent && { color: c.onErrorBg }, st.paid && { color: c.primary }]}>{st.label}</Text>
                </View>
                <View style={s.billActions}>
                  {!st.paid && <View style={{ flex: 3 }}><Button label="Tandai lunas" icon="check-circle" onPress={() => confirmPay(b)} /></View>}
                  <View style={{ flex: 2 }}><Button label="Ubah" variant="soft" onPress={() => onEditBill(b)} /></View>
                </View>
              </View>
            );
          })}
          <Button label="Tambah tagihan rutin" icon="add-circle" variant="soft" onPress={() => onEditBill(null)} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  duo: { flexDirection: 'row', gap: 8 },
  duoBox: { flex: 1, backgroundColor: c.cardAlt, borderRadius: 12, padding: 10 },
  duoLabel: { fontFamily: F.medium, fontSize: 13, color: c.muted },
  duoValue: { fontFamily: F.bold, fontSize: 16, marginTop: 2, ...amountText },
  gridCard: { paddingHorizontal: 6, paddingVertical: 12 },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', fontFamily: F.bold, fontSize: 12, color: c.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, minHeight: 58, alignItems: 'center', paddingTop: 4 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  todayRing: { borderWidth: 1.5, borderColor: c.primary },
  selCircle: { backgroundColor: c.primary },
  dayNum: { fontFamily: F.medium, fontSize: 14, color: c.text, ...amountText },
  markers: { flexDirection: 'row', gap: 3, height: 10, alignItems: 'center', marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  square: { width: 7, height: 7, borderRadius: 1 },
  ring: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontFamily: F.medium, fontSize: 12, color: c.muted },
  listCard: { padding: 0, paddingVertical: 8, overflow: 'hidden' },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6 },
  dayTitle: { fontFamily: F.bold, fontSize: 16, color: c.text },
  dayCount: { fontFamily: F.medium, fontSize: 13, color: c.muted },
  dayTotals: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 2, marginBottom: 4 },
  dayTotal: { fontFamily: F.bold, fontSize: 14, ...amountText },
  bill: { backgroundColor: c.cardAlt, borderRadius: 14, padding: 12, gap: 10 },
  billTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  billName: { fontFamily: F.semibold, fontSize: 15, color: c.text },
  billDate: { fontFamily: F.regular, fontSize: 12, color: c.muted, marginTop: 2 },
  billAmount: { fontFamily: F.bold, fontSize: 14, color: c.text, ...amountText },
  status: { alignSelf: 'flex-start', backgroundColor: c.container, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: F.semibold, fontSize: 12, color: c.muted },
  billActions: { flexDirection: 'row', gap: 8 },
});
