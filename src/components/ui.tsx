import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { getCategory } from '../categories';
import { formatRupiah, formatShortDate } from '../format';
import { colors } from '../theme';
import { Transaction } from '../types';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Navigator({ label, onPrev, onNext, onLabelPress }: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onLabelPress?: () => void;
}) {
  return (
    <View style={styles.nav}>
      <Pressable onPress={onPrev} style={styles.navBtn} hitSlop={8}>
        <Text style={styles.navArrow}>‹</Text>
      </Pressable>
      <Pressable onPress={onLabelPress} style={{ flex: 1 }}>
        <Text style={styles.navLabel}>{label}</Text>
      </Pressable>
      <Pressable onPress={onNext} style={styles.navBtn} hitSlop={8}>
        <Text style={styles.navArrow}>›</Text>
      </Pressable>
    </View>
  );
}

export function SummaryRow({ income, expense }: { income: number; expense: number }) {
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryBox, { backgroundColor: colors.incomeBg }]}>
        <Text style={styles.summaryLabel}>⬇ Pemasukan</Text>
        <Text style={[styles.summaryValue, { color: colors.income }]} numberOfLines={1} adjustsFontSizeToFit>
          {formatRupiah(income)}
        </Text>
      </View>
      <View style={[styles.summaryBox, { backgroundColor: colors.expenseBg }]}>
        <Text style={styles.summaryLabel}>⬆ Pengeluaran</Text>
        <Text style={[styles.summaryValue, { color: colors.expense }]} numberOfLines={1} adjustsFontSizeToFit>
          {formatRupiah(expense)}
        </Text>
      </View>
    </View>
  );
}

export function TxItem({ tx, onPress, showDate }: { tx: Transaction; onPress: () => void; showDate?: boolean }) {
  const cat = getCategory(tx.category);
  const isIncome = tx.type === 'income';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.txItem, pressed && { opacity: 0.6 }]}>
      <View style={[styles.txIcon, { backgroundColor: cat.color + '22' }]}>
        <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txTitle} numberOfLines={1}>{tx.note || cat.label}</Text>
        <Text style={styles.txSub} numberOfLines={1}>
          {tx.note ? cat.label : ''}
          {tx.note && showDate ? ' · ' : ''}
          {showDate ? formatShortDate(tx.date) : ''}
        </Text>
      </View>
      <Text style={[styles.txAmount, { color: isIncome ? colors.income : colors.expense }]}>
        {isIncome ? '+' : '-'}{formatRupiah(tx.amount).replace('Rp ', 'Rp')}
      </Text>
    </Pressable>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 36 }}>🗒️</Text>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 14,
    elevation: 1,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.bg },
  navArrow: { fontSize: 26, color: colors.primary, fontWeight: '600', marginTop: -3 },
  navLabel: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.text },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryBox: { flex: 1, borderRadius: 14, padding: 12 },
  summaryLabel: { fontSize: 12, color: colors.muted, marginBottom: 4, fontWeight: '600' },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  txIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  txSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { color: colors.muted, textAlign: 'center' },
});
