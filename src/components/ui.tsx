import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { getCategory } from '../categories';
import { formatRupiah, formatShortDate } from '../format';
import { amountText, Colors, MAX_CONTENT_WIDTH, MIN_TAP, useColors, useStyles } from '../theme';
import { Transaction } from '../types';

export function Screen({ children }: { children: React.ReactNode }) {
  const s = useStyles(styles);
  return <ScrollView contentContainerStyle={s.screen}>{children}</ScrollView>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const s = useStyles(styles);
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const s = useStyles(styles);
  return <Text style={s.sectionTitle} accessibilityRole="header">{children}</Text>;
}

interface NavigatorProps {
  label: string;
  prevLabel: string;
  nextLabel: string;
  resetHint: string;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

export function Navigator({ label, prevLabel, nextLabel, resetHint, onPrev, onNext, onReset }: NavigatorProps) {
  const s = useStyles(styles);
  return (
    <View style={s.nav}>
      <Pressable onPress={onPrev} style={({ pressed }) => [s.navBtn, pressed && s.pressed]}
        accessibilityRole="button" accessibilityLabel={prevLabel}>
        <Text style={s.navArrow} importantForAccessibility="no">‹</Text>
      </Pressable>
      <Pressable onPress={onReset} style={({ pressed }) => [s.navCenter, pressed && s.pressed]}
        accessibilityRole="button" accessibilityLabel={label} accessibilityHint={resetHint}>
        <Text style={s.navLabel}>{label}</Text>
      </Pressable>
      <Pressable onPress={onNext} style={({ pressed }) => [s.navBtn, pressed && s.pressed]}
        accessibilityRole="button" accessibilityLabel={nextLabel}>
        <Text style={s.navArrow} importantForAccessibility="no">›</Text>
      </Pressable>
    </View>
  );
}

/** Angka total dengan garis ganda di bawahnya: penanda jumlah akhir dalam pembukuan. */
export function Total({ label, value, tone }: { label: string; value: number; tone?: 'auto' | 'plain' }) {
  const s = useStyles(styles);
  const c = useColors();
  const color = tone === 'plain' ? c.text : value < 0 ? c.expense : c.text;
  return (
    <View accessible accessibilityLabel={`${label} ${formatRupiah(value)}`}>
      <Text style={s.totalLabel}>{label}</Text>
      <View style={{ alignSelf: 'flex-start' }}>
        <Text style={[s.totalValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
          {formatRupiah(value)}
        </Text>
        <View style={s.rule} />
        <View style={[s.rule, { marginTop: 2 }]} />
      </View>
    </View>
  );
}

export function SummaryRow({ income, expense }: { income: number; expense: number }) {
  const s = useStyles(styles);
  const c = useColors();
  return (
    <View style={s.summaryRow}>
      <View style={s.summaryCol} accessible accessibilityLabel={`Pemasukan ${formatRupiah(income)}`}>
        <Text style={s.summaryLabel}>Pemasukan</Text>
        <Text style={[s.summaryValue, { color: c.income }]} numberOfLines={1} adjustsFontSizeToFit>
          +{formatRupiah(income)}
        </Text>
      </View>
      <View style={[s.summaryCol, s.summaryDivider]} accessible accessibilityLabel={`Pengeluaran ${formatRupiah(expense)}`}>
        <Text style={s.summaryLabel}>Pengeluaran</Text>
        <Text style={[s.summaryValue, { color: c.expense }]} numberOfLines={1} adjustsFontSizeToFit>
          -{formatRupiah(expense)}
        </Text>
      </View>
    </View>
  );
}

export function LineItem({ label, value, color }: { label: string; value: string; color?: string }) {
  const s = useStyles(styles);
  return (
    <View style={s.lineItem} accessible accessibilityLabel={`${label} ${value}`}>
      <Text style={s.lineLabel}>{label}</Text>
      <Text style={[s.lineValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

export function TxItem({ tx, onPress, showDate }: { tx: Transaction; onPress: () => void; showDate?: boolean }) {
  const s = useStyles(styles);
  const c = useColors();
  const cat = getCategory(tx.category);
  const isIncome = tx.type === 'income';
  const sub = [tx.note ? cat.label : '', showDate ? formatShortDate(tx.date) : ''].filter(Boolean).join(', ');
  const amount = `${isIncome ? '+' : '-'}${formatRupiah(tx.amount)}`;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.txItem, pressed && s.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${isIncome ? 'Pemasukan' : 'Pengeluaran'} ${tx.note || cat.label}, ${sub ? sub + ', ' : ''}${formatRupiah(tx.amount)}`}
      accessibilityHint="Ketuk untuk mengubah atau menghapus"
    >
      <Text style={s.txIcon} importantForAccessibility="no">{cat.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.txTitle} numberOfLines={1}>{tx.note || cat.label}</Text>
        {sub ? <Text style={s.txSub} numberOfLines={1}>{sub}</Text> : null}
      </View>
      <Text style={[s.txAmount, { color: isIncome ? c.income : c.expense }]}>{amount}</Text>
    </Pressable>
  );
}

export function Empty({ text, action }: { text: string; action?: string }) {
  const s = useStyles(styles);
  return (
    <View style={s.empty}>
      <Text style={s.emptyText}>{text}</Text>
      {action ? <Text style={s.emptyAction}>{action}</Text> : null}
    </View>
  );
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: string; activeColor: string; activeText: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}

export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  const s = useStyles(styles);
  return (
    <View style={s.segment} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [s.segmentBtn, active && { backgroundColor: o.activeColor }, pressed && !active && s.pressed]}
            accessibilityRole="radio"
            aria-checked={active}
            accessibilityLabel={o.label}
          >
            <Text style={[s.segmentText, active && { color: o.activeText }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = (c: Colors) => ({
  screen: {
    padding: 16,
    paddingBottom: 96,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    padding: 16,
    marginBottom: 12,
  },
  pressed: { backgroundColor: c.pressed },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 8 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  navBtn: { width: MIN_TAP + 4, height: MIN_TAP + 4, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  navCenter: { flex: 1, minHeight: MIN_TAP + 4, justifyContent: 'center', borderRadius: 10 },
  navArrow: { fontSize: 28, color: c.accent, fontWeight: '600', marginTop: -4 },
  navLabel: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: c.text },
  totalLabel: { fontSize: 14, color: c.muted, fontWeight: '600', marginBottom: 4 },
  totalValue: { fontSize: 32, fontWeight: '800', ...amountText },
  rule: { height: 1.5, backgroundColor: c.text, marginTop: 4 },
  summaryRow: { flexDirection: 'row', marginTop: 16 },
  summaryCol: { flex: 1 },
  summaryDivider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: c.line, paddingLeft: 12 },
  summaryLabel: { fontSize: 13, color: c.muted, marginBottom: 2, fontWeight: '600' },
  summaryValue: { fontSize: 17, fontWeight: '700', ...amountText },
  lineItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line, gap: 12,
  },
  lineLabel: { color: c.muted, fontWeight: '600', flexShrink: 1 },
  lineValue: { fontWeight: '700', color: c.text, flexShrink: 0, ...amountText },
  txItem: {
    flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingVertical: 8, gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line, marginHorizontal: -8, paddingHorizontal: 8,
  },
  txIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  txTitle: { fontSize: 15, fontWeight: '600', color: c.text },
  txSub: { fontSize: 13, color: c.muted, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700', ...amountText },
  empty: { paddingVertical: 16, gap: 4 },
  emptyText: { color: c.text, fontSize: 15 },
  emptyAction: { color: c.muted, fontSize: 14 },
  segment: {
    flexDirection: 'row', backgroundColor: c.card, borderRadius: 10, padding: 3,
    borderWidth: 1, borderColor: c.control, gap: 3,
  },
  segmentBtn: { flex: 1, minHeight: MIN_TAP, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontWeight: '700', color: c.muted, fontSize: 15 },
}) as const;
