import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { findCategory } from '../categories';
import {
  Card, ChangeNote, Divider, Empty, Icon, IconCircle, ProgressBar, Screen, SectionHeader, TxRow,
} from '../components/ui';
import { addDays, formatRupiah, percentChange, shortDayLabel, todayKey } from '../format';
import { cycleMonthOf, cycleRange, inPeriod } from '../periods';
import { sumBy, useStore } from '../store';
import { amountText, Colors, F, MIN_TAP, useColors, useStyles } from '../theme';
import { Transaction, TxType } from '../types';

interface Props {
  onEdit: (tx: Transaction) => void;
  onAdd: (type: TxType) => void;
  onSeeAll: () => void;
  onManageBudgets: () => void;
}

export default function HomeScreen({ onEdit, onAdd, onSeeAll, onManageBudgets }: Props) {
  const { transactions, settings, updateSettings, budgets, categories } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const today = todayKey();
  const startDay = settings.cycleStartDay;
  const cycleMonth = cycleMonthOf(today, startDay);
  const period = cycleRange(cycleMonth, startDay);
  const prevPeriod = cycleRange(cycleMonthOf(addDays(period.start, -1), startDay), startDay);

  const all = useMemo(() => sumBy(transactions), [transactions]);
  const cur = useMemo(() => transactions.filter((t) => inPeriod(t, period)), [transactions, period.start]);
  const curSum = sumBy(cur);
  const prevSum = useMemo(() => sumBy(transactions.filter((t) => inPeriod(t, prevPeriod))), [transactions, prevPeriod.start]);

  const budgetRows = Object.entries(budgets)
    .filter(([, limit]) => limit > 0)
    .map(([key, limit]) => {
      const spent = cur.filter((t) => t.type === 'expense' && t.category === key).reduce((a, t) => a + t.amount, 0);
      return { key, limit, spent, ratio: spent / limit };
    })
    .sort((a, b) => b.ratio - a.ratio);

  const last7 = { start: addDays(today, -6), end: today };
  const prev7 = { start: addDays(today, -13), end: addDays(today, -7) };
  const exp = (p: { start: string; end: string }) =>
    transactions.filter((t) => t.type === 'expense' && t.date >= p.start && t.date <= p.end).reduce((a, t) => a + t.amount, 0);
  const exp7 = exp(last7);
  const expPrev7 = exp(prev7);
  const change7 = percentChange(exp7, expPrev7);

  const hidden = settings.hideBalance;

  return (
    <Screen>
      <Text style={s.period}>Periode berjalan: {period.label}</Text>

      <View style={s.balanceCard}>
        <View style={s.balanceTop}>
          <Text style={s.balanceLabel}>Total saldo</Text>
          <Pressable
            onPress={() => updateSettings({ hideBalance: !hidden })}
            style={({ pressed }) => [s.eyeBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
          >
            <Icon name={hidden ? 'visibility-off' : 'visibility'} size={20} color={c.onPrimary} />
          </Pressable>
        </View>
        <View style={s.balanceRow} accessible accessibilityLabel={hidden ? 'Saldo disembunyikan' : `Saldo ${formatRupiah(all.balance)}`}>
          <Text style={s.balanceRp}>{all.balance < 0 && !hidden ? '-Rp' : 'Rp'}</Text>
          <Text style={s.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
            {hidden ? '••••••••' : formatRupiah(Math.abs(all.balance)).replace('Rp ', '')}
          </Text>
        </View>
        <Text style={s.balanceNote}>
          {hidden ? 'Saldo disembunyikan' : `Selisih ${period.label}: ${curSum.balance >= 0 ? '+' : '-'}${formatRupiah(Math.abs(curSum.balance))}`}
        </Text>
        <View style={s.balanceActions}>
          <Pressable onPress={() => onAdd('income')} style={({ pressed }) => [s.actionLight, pressed && { opacity: 0.85 }]}
            accessibilityRole="button" accessibilityLabel="Catat pemasukan">
            <Icon name="add-circle" size={20} color={c.primary} />
            <Text style={s.actionLightText}>Pemasukan</Text>
          </Pressable>
          <Pressable onPress={() => onAdd('expense')} style={({ pressed }) => [s.actionDark, pressed && { opacity: 0.85 }]}
            accessibilityRole="button" accessibilityLabel="Catat pengeluaran">
            <Icon name="remove-circle" size={20} color={c.onPrimary} />
            <Text style={s.actionDarkText}>Pengeluaran</Text>
          </Pressable>
        </View>
      </View>

      <View style={s.duo}>
        <Card style={s.duoCard}>
          <View style={s.duoTop}>
            <Text style={s.duoLabel}>Pemasukan</Text>
            <IconCircle name="arrow-downward" tone="primary" size={32} />
          </View>
          <Text style={s.duoSub}>Periode ini</Text>
          <Text style={[s.duoValue, { color: c.income }]} numberOfLines={1} adjustsFontSizeToFit>{formatRupiah(curSum.income)}</Text>
          <ChangeNote pct={percentChange(curSum.income, prevSum.income)} goodWhenDown={false} compareLabel={prevPeriod.compareLabel} />
        </Card>
        <Card style={s.duoCard}>
          <View style={s.duoTop}>
            <Text style={s.duoLabel}>Pengeluaran</Text>
            <IconCircle name="arrow-upward" tone="expense" size={32} />
          </View>
          <Text style={s.duoSub}>Periode ini</Text>
          <Text style={s.duoValue} numberOfLines={1} adjustsFontSizeToFit>{formatRupiah(curSum.expense)}</Text>
          <ChangeNote pct={percentChange(curSum.expense, prevSum.expense)} goodWhenDown compareLabel={prevPeriod.compareLabel} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Pos anggaran" action="Kelola" onAction={onManageBudgets} actionLabel="Kelola pos anggaran" />
        <Card style={{ gap: 18 }}>
          {budgetRows.length === 0 ? (
            <Empty
              icon="tune"
              title="Belum ada pos anggaran"
              text="Tentukan batas pengeluaran per kategori, misalnya Makan & Minum Rp 1.500.000 per bulan."
              action="Atur anggaran"
              onAction={onManageBudgets}
            />
          ) : budgetRows.map((b) => {
            const cat = findCategory(categories, b.key);
            const over = b.spent > b.limit;
            const near = !over && b.ratio >= 0.9;
            const left = b.limit - b.spent;
            return (
              <View key={b.key} style={{ gap: 8 }} accessible
                accessibilityLabel={`${cat.label}: terpakai ${formatRupiah(b.spent)} dari ${formatRupiah(b.limit)}. ${over ? 'Melebihi batas ' + formatRupiah(-left) : 'Sisa ' + formatRupiah(left)}`}>
                <View style={s.budgetTop}>
                  <IconCircle name={cat.icon} tone={over || near ? 'expense' : 'neutral'} size={36} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.budgetName} numberOfLines={1}>{cat.label}</Text>
                    <Text style={[s.budgetSub, (over || near) && { color: c.expense }]}>
                      {over ? `Melebihi batas ${formatRupiah(-left)}` : near ? `Mendekati batas. Sisa ${formatRupiah(left)}` : `Sisa ${formatRupiah(left)}`}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.budgetSpent}>{formatRupiah(b.spent)}</Text>
                    <Text style={s.budgetLimit}>dari {formatRupiah(b.limit)}</Text>
                  </View>
                </View>
                <ProgressBar value={b.ratio} color={over || near ? c.expense : c.primary} />
              </View>
            );
          })}
        </Card>
      </View>

      <View>
        <SectionHeader title="Transaksi terbaru" action={transactions.length ? 'Lihat semua' : undefined} onAction={onSeeAll}
          actionLabel="Lihat semua transaksi" />
        <Card style={s.listCard}>
          {transactions.length === 0 ? (
            <Empty icon="receipt-long" title="Belum ada catatan"
              text="Catat pemasukan atau pengeluaran pertama dengan tombol di kartu saldo, atau tombol Catat Baru." />
          ) : transactions.slice(0, 5).map((t, i) => (
            <View key={t.id}>
              {i > 0 && <Divider />}
              <TxRow tx={t} onPress={() => onEdit(t)} showDate={shortDayLabel(t.date)} />
            </View>
          ))}
        </Card>
      </View>

      {change7 !== null && (
        <View style={s.tip}>
          <IconCircle name="date-range" tone="primary" size={36} />
          <View style={{ flex: 1 }}>
            <Text style={s.tipTitle}>Pengeluaran 7 hari terakhir</Text>
            <Text style={s.tipText}>
              {formatRupiah(exp7)}, {change7 === 0 ? 'sama dengan' : change7 < 0 ? `turun ${-change7}% dibanding` : `naik ${change7}% dibanding`} 7 hari sebelumnya ({formatRupiah(expPrev7)}).
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  period: { fontFamily: F.semibold, fontSize: 14, color: c.muted },
  balanceCard: { backgroundColor: c.primary, borderRadius: 20, padding: 18, gap: 4 },
  balanceTop: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  balanceLabel: { fontFamily: F.medium, fontSize: 14, color: c.onPrimarySoft },
  eyeBtn: { width: MIN_TAP, height: MIN_TAP, alignItems: 'center', justifyContent: 'center', borderRadius: 22, marginVertical: -8 },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  balanceRp: { fontFamily: F.bold, fontSize: 16, color: c.onPrimarySoft },
  balanceValue: { flexShrink: 1, fontFamily: F.bold, fontSize: 32, color: c.onPrimary, ...amountText },
  balanceNote: { fontFamily: F.medium, fontSize: 13, color: c.onPrimarySoft, ...amountText },
  balanceActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionLight: {
    flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: c.card, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  actionLightText: { fontFamily: F.bold, fontSize: 14, color: c.primary },
  actionDark: {
    flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: c.onPrimarySoft, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  actionDarkText: { fontFamily: F.bold, fontSize: 14, color: c.onPrimary },
  duo: { flexDirection: 'row', gap: 10 },
  duoCard: { flex: 1, padding: 14, gap: 4 },
  duoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  duoLabel: { fontFamily: F.semibold, fontSize: 14, color: c.muted },
  duoSub: { fontFamily: F.regular, fontSize: 12, color: c.subtle },
  duoValue: { fontFamily: F.bold, fontSize: 18, color: c.text, marginBottom: 2, ...amountText },
  budgetTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  budgetName: { fontFamily: F.semibold, fontSize: 15, color: c.text },
  budgetSub: { fontFamily: F.regular, fontSize: 13, color: c.muted, ...amountText },
  budgetSpent: { fontFamily: F.bold, fontSize: 14, color: c.text, ...amountText },
  budgetLimit: { fontFamily: F.regular, fontSize: 12, color: c.muted, ...amountText },
  listCard: { padding: 0, paddingVertical: 4, overflow: 'hidden' },
  tip: { flexDirection: 'row', gap: 12, backgroundColor: c.cardAlt, borderRadius: 16, padding: 14, alignItems: 'flex-start' },
  tipTitle: { fontFamily: F.bold, fontSize: 14, color: c.text },
  tipText: { fontFamily: F.regular, fontSize: 14, color: c.muted, marginTop: 2, lineHeight: 20, ...amountText },
});
