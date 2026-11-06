import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput,
  View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { findCategory } from '../categories';
import { formatNumberInput, formatRupiah } from '../format';
import { useStore } from '../store';
import { amountText, Colors, F, MAX_CONTENT_WIDTH, MIN_TAP, useColors, useStyles } from '../theme';
import { Transaction } from '../types';

type IconName = keyof typeof MaterialIcons.glyphMap;

export function Icon({ name, size = 22, color }: { name: string; size?: number; color: string }) {
  return <MaterialIcons name={name as IconName} size={size} color={color} importantForAccessibility="no" accessibilityElementsHidden />;
}

export function IconCircle({ name, tone = 'neutral', size = 44 }: { name: string; tone?: 'neutral' | 'primary' | 'expense'; size?: number }) {
  const c = useColors();
  const bg = tone === 'primary' ? c.iconBg : tone === 'expense' ? c.errorBg : c.cardAlt;
  const fg = tone === 'primary' ? c.primary : tone === 'expense' ? c.onErrorBg : c.muted;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={size * 0.5} color={fg} />
    </View>
  );
}

export function Screen({ children }: { children: React.ReactNode }) {
  const s = useStyles(styles);
  return <ScrollView contentContainerStyle={s.screen} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const s = useStyles(styles);
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionHeader({ title, action, onAction, actionLabel }: {
  title: string; action?: string; onAction?: () => void; actionLabel?: string;
}) {
  const s = useStyles(styles);
  const c = useColors();
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle} accessibilityRole="header">{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [s.linkBtn, pressed && s.pressed]}
          accessibilityRole="button" accessibilityLabel={actionLabel ?? action}>
          <Text style={s.linkText}>{action}</Text>
          <Icon name="chevron-right" size={18} color={c.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Navigator({ label, onPrev, onNext, prevLabel, nextLabel }: {
  label: string; onPrev: () => void; onNext: () => void; prevLabel: string; nextLabel: string;
}) {
  const s = useStyles(styles);
  const c = useColors();
  return (
    <View style={s.nav}>
      <Pressable onPress={onPrev} style={({ pressed }) => [s.navBtn, pressed && s.pressed]}
        accessibilityRole="button" accessibilityLabel={prevLabel}>
        <Icon name="chevron-left" color={c.text} />
      </Pressable>
      <Text style={s.navLabel} accessibilityRole="header">{label}</Text>
      <Pressable onPress={onNext} style={({ pressed }) => [s.navBtn, pressed && s.pressed]}
        accessibilityRole="button" accessibilityLabel={nextLabel}>
        <Icon name="chevron-right" color={c.text} />
      </Pressable>
    </View>
  );
}

interface SegmentOption<T extends string> { value: T; label: string; icon?: string }

export function Segmented<T extends string>({ options, value, onChange, label, small }: {
  options: SegmentOption<T>[]; value: T; onChange: (v: T) => void; label: string; small?: boolean;
}) {
  const s = useStyles(styles);
  const c = useColors();
  return (
    <View style={[s.segment, small && s.segmentSmall]} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [s.segmentBtn, active && (small ? s.segmentActiveSmall : s.segmentActive), pressed && !active && s.pressed]}
            accessibilityRole="radio"
            aria-checked={active}
            accessibilityLabel={o.label}
          >
            {o.icon ? <Icon name={o.icon} size={18} color={active && !small ? c.onPrimary : active ? c.primary : c.muted} /> : null}
            <Text style={[s.segmentText, active && (small ? s.segmentTextActiveSmall : s.segmentTextActive)]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ChangeNote({ pct, goodWhenDown, compareLabel }: { pct: number | null; goodWhenDown: boolean; compareLabel: string }) {
  const s = useStyles(styles);
  const c = useColors();
  if (pct === null) return <Text style={s.changeNeutral}>Belum ada data {compareLabel} untuk dibandingkan</Text>;
  if (pct === 0) return <Text style={s.changeNeutral}>Sama dengan {compareLabel}</Text>;
  const down = pct < 0;
  const good = down === goodWhenDown;
  const color = good ? c.primary : c.expense;
  return (
    <View style={s.changeRow}>
      <View style={{ marginTop: 1 }}><Icon name={down ? 'arrow-downward' : 'arrow-upward'} size={16} color={color} /></View>
      <Text style={[s.changeText, { color }]}>
        {down ? 'Turun' : 'Naik'} {Math.abs(pct)}% dari {compareLabel}
      </Text>
    </View>
  );
}

export function ProgressBar({ value, color }: { value: number; color: string }) {
  const s = useStyles(styles);
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export function TxRow({ tx, onPress, showDate }: { tx: Transaction; onPress: () => void; showDate?: string }) {
  const s = useStyles(styles);
  const c = useColors();
  const { categories } = useStore();
  const cat = findCategory(categories, tx.category);
  const isIncome = tx.type === 'income';
  const title = tx.note || cat.label;
  const sub = [tx.note ? cat.label : '', showDate ?? ''].filter(Boolean).join(' · ');
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.txRow, pressed && s.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${isIncome ? 'Pemasukan' : 'Pengeluaran'} ${title}${sub ? ', ' + sub : ''}, ${formatRupiah(tx.amount)}`}
      accessibilityHint="Ketuk untuk mengubah atau menghapus"
    >
      <IconCircle name={cat.icon} tone={isIncome ? 'primary' : 'neutral'} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.txTitle} numberOfLines={1}>{title}</Text>
        {sub ? <Text style={s.txSub} numberOfLines={1}>{sub}</Text> : null}
      </View>
      <Text style={[s.txAmount, { color: isIncome ? c.income : c.text }]}>
        {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
      </Text>
    </Pressable>
  );
}

export function Divider() {
  const s = useStyles(styles);
  return <View style={s.divider} />;
}

export function Empty({ icon, title, text, action, onAction }: {
  icon: string; title: string; text?: string; action?: string; onAction?: () => void;
}) {
  const s = useStyles(styles);
  const c = useColors();
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}><Icon name={icon} size={30} color={c.muted} /></View>
      <Text style={s.emptyTitle}>{title}</Text>
      {text ? <Text style={s.emptyText}>{text}</Text> : null}
      {action && onAction ? <Button label={action} onPress={onAction} variant="soft" /> : null}
    </View>
  );
}

export function Button({ label, onPress, variant = 'primary', icon, danger }: {
  label: string; onPress: () => void; variant?: 'primary' | 'soft' | 'plain'; icon?: string; danger?: boolean;
}) {
  const s = useStyles(styles);
  const c = useColors();
  const bg = variant === 'primary' ? (danger ? c.expense : c.primary) : variant === 'soft' ? (danger ? c.errorBg : c.cardAlt) : 'transparent';
  const fg = variant === 'primary' ? (danger ? c.onExpense : c.onPrimary) : danger ? (variant === 'soft' ? c.onErrorBg : c.expense) : c.primary;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [s.button, { backgroundColor: bg }, pressed && { opacity: 0.8 }]}>
      {icon ? <Icon name={icon} size={20} color={fg} /> : null}
      <Text style={[s.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function ListRow({ icon, title, subtitle, right, onPress, children }: {
  icon: string; title: string; subtitle?: string; right?: string; onPress?: () => void; children?: React.ReactNode;
}) {
  const s = useStyles(styles);
  const c = useColors();
  const body = (
    <>
      <View style={s.listIcon}><Icon name={icon} color={c.primary} /></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.listTitle}>{title}</Text>
        {subtitle ? <Text style={s.listSub}>{subtitle}</Text> : null}
      </View>
      {right ? <Text style={s.listRight}>{right}</Text> : null}
      {children}
      {onPress ? <Icon name="chevron-right" size={22} color={c.subtle} /> : null}
    </>
  );
  if (!onPress) return <View style={s.listRow}>{body}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.listRow, pressed && s.pressed]}
      accessibilityRole="button" accessibilityLabel={[title, subtitle, right].filter(Boolean).join(', ')}>
      {body}
    </Pressable>
  );
}

export function FieldLabel({ children, nativeID }: { children: string; nativeID?: string }) {
  const s = useStyles(styles);
  return <Text style={s.fieldLabel} nativeID={nativeID}>{children}</Text>;
}

export function AmountInput({ value, onChange, color, label, autoFocus }: {
  value: string; onChange: (v: string) => void; color?: string; label: string; autoFocus?: boolean;
}) {
  const s = useStyles(styles);
  const c = useColors();
  const tint = color ?? c.text;
  return (
    <View style={[s.amountBox, { borderColor: color ?? c.control }]}>
      <Text style={[s.rp, { color: tint }]} importantForAccessibility="no">Rp</Text>
      <TextInput
        value={value}
        onChangeText={(v) => onChange(formatNumberInput(v))}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={c.subtle}
        style={[s.amountInput, { color: tint }]}
        autoFocus={autoFocus}
        accessibilityLabel={`${label} dalam rupiah`}
      />
    </View>
  );
}

export function TextField({ value, onChange, label, placeholder, maxLength }: {
  value: string; onChange: (v: string) => void; label: string; placeholder?: string; maxLength?: number;
}) {
  const s = useStyles(styles);
  const c = useColors();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={c.subtle}
      style={s.textInput}
      maxLength={maxLength}
      accessibilityLabel={label}
    />
  );
}

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  return reduce;
}

/** Layar penuh di atas tab, dipakai untuk form dan halaman pengaturan. */
export function ModalScreen({ visible, title, onClose, closeLabel = 'Batal', onSave, saveLabel = 'Simpan', children }: {
  visible: boolean; title: string; onClose: () => void; closeLabel?: string;
  onSave?: () => void; saveLabel?: string; children: React.ReactNode;
}) {
  const s = useStyles(styles);
  const reduceMotion = useReduceMotion();
  return (
    <Modal visible={visible} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={onClose}>
      <SafeAreaView style={s.modalRoot}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalHeader}>
            <Pressable onPress={onClose} style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
              accessibilityRole="button" accessibilityLabel={`${closeLabel}, tutup ${title}`}>
              <Text style={s.headerBtnText}>{closeLabel}</Text>
            </Pressable>
            <Text style={s.modalTitle} accessibilityRole="header" numberOfLines={1}>{title}</Text>
            {onSave ? (
              <Pressable onPress={onSave} style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
                accessibilityRole="button" accessibilityLabel={saveLabel}>
                <Text style={[s.headerBtnText, { fontFamily: F.bold }]}>{saveLabel}</Text>
              </Pressable>
            ) : <View style={s.headerBtn} />}
          </View>
          <ScrollView contentContainerStyle={s.modalBody} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  screen: { padding: 16, paddingBottom: 104, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', gap: 16 },
  card: {
    backgroundColor: c.card, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  pressed: { backgroundColor: c.pressed },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: MIN_TAP },
  sectionTitle: { fontFamily: F.bold, fontSize: 18, color: c.text },
  linkBtn: { flexDirection: 'row', alignItems: 'center', minHeight: MIN_TAP, paddingHorizontal: 8, borderRadius: 10 },
  linkText: { fontFamily: F.semibold, fontSize: 14, color: c.primary },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  navBtn: { width: MIN_TAP + 4, height: MIN_TAP + 4, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: c.cardAlt },
  navLabel: { flex: 1, textAlign: 'center', fontFamily: F.bold, fontSize: 17, color: c.text },
  segment: { flexDirection: 'row', backgroundColor: c.container, borderRadius: 14, padding: 4, gap: 4 },
  segmentSmall: { backgroundColor: c.cardAlt },
  segmentBtn: { flex: 1, minHeight: MIN_TAP, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8 },
  segmentActive: { backgroundColor: c.primary },
  segmentActiveSmall: { backgroundColor: c.card, borderWidth: 1, borderColor: c.primary },
  segmentText: { fontFamily: F.semibold, fontSize: 14, color: c.muted },
  segmentTextActive: { color: c.onPrimary },
  segmentTextActiveSmall: { color: c.primary, fontFamily: F.bold },
  changeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  changeText: { fontFamily: F.semibold, fontSize: 13, flexShrink: 1 },
  changeNeutral: { fontFamily: F.medium, fontSize: 13, color: c.subtle },
  track: { height: 8, borderRadius: 4, backgroundColor: c.container, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10, paddingHorizontal: 16 },
  txTitle: { fontFamily: F.semibold, fontSize: 15, color: c.text },
  txSub: { fontFamily: F.regular, fontSize: 13, color: c.muted, marginTop: 2 },
  txAmount: { fontFamily: F.bold, fontSize: 15, ...amountText },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginHorizontal: 16 },
  empty: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, gap: 8 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.container, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: F.bold, fontSize: 17, color: c.text, textAlign: 'center' },
  emptyText: { fontFamily: F.regular, fontSize: 14, color: c.muted, textAlign: 'center', maxWidth: 300, marginBottom: 4 },
  button: { minHeight: 48, borderRadius: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { fontFamily: F.bold, fontSize: 15 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 64, paddingVertical: 10, paddingHorizontal: 16 },
  listIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.cardAlt, alignItems: 'center', justifyContent: 'center' },
  listTitle: { fontFamily: F.semibold, fontSize: 15, color: c.text },
  listSub: { fontFamily: F.regular, fontSize: 13, color: c.muted, marginTop: 2 },
  listRight: { fontFamily: F.bold, fontSize: 14, color: c.text, ...amountText },
  fieldLabel: { fontFamily: F.semibold, fontSize: 14, color: c.muted, marginBottom: 8, marginTop: 20 },
  amountBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 14, borderWidth: 2, paddingHorizontal: 14 },
  rp: { fontFamily: F.bold, fontSize: 22, marginRight: 8 },
  amountInput: { flex: 1, fontFamily: F.extrabold, fontSize: 28, paddingVertical: 12, ...amountText },
  textInput: {
    backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.control,
    paddingHorizontal: 14, minHeight: 52, fontSize: 16, color: c.text, fontFamily: F.regular,
  },
  modalRoot: { flex: 1, backgroundColor: c.bg },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: c.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line,
  },
  modalTitle: { flex: 1, textAlign: 'center', fontFamily: F.bold, fontSize: 17, color: c.text },
  headerBtn: { minHeight: MIN_TAP + 4, minWidth: 72, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  headerBtnText: { fontFamily: F.semibold, fontSize: 16, color: c.primary },
  modalBody: { padding: 16, paddingBottom: 40, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
});
