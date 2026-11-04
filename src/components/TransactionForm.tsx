import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoriesFor } from '../categories';
import { addDays, formatNumberInput, relativeDayLabel, todayKey } from '../format';
import { useStore } from '../store';
import { amountText, Colors, MAX_CONTENT_WIDTH, MIN_TAP, useColors, useStyles } from '../theme';
import { Transaction, TxType } from '../types';
import { Segmented } from './ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  editing?: Transaction | null;
  defaultDate?: string;
}

export default function TransactionForm({ visible, onClose, editing, defaultDate }: Props) {
  const { save, remove } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayKey());
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setType(editing.type);
      setAmount(formatNumberInput(String(editing.amount)));
      setCategory(editing.category);
      setNote(editing.note);
      setDate(editing.date);
    } else {
      setType('expense');
      setAmount('');
      setCategory(categoriesFor('expense')[0].key);
      setNote('');
      setDate(defaultDate ?? todayKey());
    }
  }, [visible, editing, defaultDate]);

  const switchType = (t: TxType) => {
    setType(t);
    if (!categoriesFor(t).some((x) => x.key === category)) setCategory(categoriesFor(t)[0].key);
  };

  const onSave = () => {
    const value = Number(amount.replace(/\D/g, ''));
    if (!value) {
      Alert.alert('Jumlah masih kosong', 'Isi jumlah uangnya dulu.');
      return;
    }
    save({ id: editing?.id, type, amount: value, category, note: note.trim(), date });
    onClose();
  };

  const onDelete = () => {
    if (!editing) return;
    Alert.alert('Hapus transaksi ini?', 'Transaksi yang dihapus tidak bisa dikembalikan.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { remove(editing.id); onClose(); } },
    ]);
  };

  const accent = type === 'expense' ? c.expense : c.income;
  const onAccent = type === 'expense' ? c.onExpense : c.onAccent;

  return (
    <Modal visible={visible} animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.header}>
            <Pressable onPress={onClose} style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
              accessibilityRole="button" accessibilityLabel="Batal, tutup form">
              <Text style={s.headerBtnText}>Batal</Text>
            </Pressable>
            <Text style={s.headerTitle} accessibilityRole="header">{editing ? 'Ubah Transaksi' : 'Catat Transaksi'}</Text>
            <Pressable onPress={onSave} style={({ pressed }) => [s.headerBtn, pressed && s.pressed]}
              accessibilityRole="button" accessibilityLabel="Simpan transaksi">
              <Text style={[s.headerBtnText, { fontWeight: '700' }]}>Simpan</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
            <Segmented
              label="Jenis transaksi"
              value={type}
              onChange={switchType}
              options={[
                { value: 'expense', label: 'Pengeluaran', activeColor: c.expense, activeText: c.onExpense },
                { value: 'income', label: 'Pemasukan', activeColor: c.income, activeText: c.onAccent },
              ]}
            />

            <Text style={s.label} nativeID="label-amount">Jumlah</Text>
            <View style={[s.amountBox, { borderColor: accent }]}>
              <Text style={[s.rp, { color: accent }]} importantForAccessibility="no">Rp</Text>
              <TextInput
                value={amount}
                onChangeText={(v) => setAmount(formatNumberInput(v))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={c.muted}
                style={[s.amountInput, { color: accent }]}
                autoFocus={!editing}
                accessibilityLabel="Jumlah dalam rupiah"
                accessibilityLabelledBy="label-amount"
              />
            </View>

            <Text style={s.label}>Kategori</Text>
            <View style={s.chips} accessibilityRole="radiogroup" accessibilityLabel="Kategori">
              {categoriesFor(type).map((cat) => {
                const active = cat.key === category;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setCategory(cat.key)}
                    style={({ pressed }) => [s.chip, active && { backgroundColor: accent, borderColor: accent }, pressed && !active && s.pressed]}
                    accessibilityRole="radio"
                    aria-checked={active}
                    accessibilityLabel={cat.label}
                  >
                    <Text style={[s.chipText, active && { color: onAccent }]}>{cat.icon} {cat.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={s.label}>Tanggal</Text>
            <View style={s.dateRow}>
              <Pressable style={({ pressed }) => [s.dateBtn, pressed && s.pressed]} onPress={() => setDate(addDays(date, -1))}
                accessibilityRole="button" accessibilityLabel="Mundur satu hari">
                <Text style={s.dateArrow} importantForAccessibility="no">‹</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [s.dateCenter, pressed && s.pressed]} onPress={() => setDate(todayKey())}
                accessibilityRole="button" accessibilityLabel={`Tanggal: ${relativeDayLabel(date)}`} accessibilityHint="Ketuk untuk kembali ke hari ini">
                <Text style={s.dateText}>{relativeDayLabel(date)}</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [s.dateBtn, pressed && s.pressed]} onPress={() => setDate(addDays(date, 1))}
                accessibilityRole="button" accessibilityLabel="Maju satu hari">
                <Text style={s.dateArrow} importantForAccessibility="no">›</Text>
              </Pressable>
            </View>

            <Text style={s.label} nativeID="label-note">Catatan (boleh kosong)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Misalnya: nasi goreng, bensin"
              placeholderTextColor={c.muted}
              style={s.noteInput}
              maxLength={80}
              accessibilityLabel="Catatan, boleh kosong"
              accessibilityLabelledBy="label-note"
            />

            <Pressable onPress={onSave} style={({ pressed }) => [s.saveBtn, { backgroundColor: accent }, pressed && { opacity: 0.8 }]}
              accessibilityRole="button" accessibilityLabel="Simpan transaksi">
              <Text style={[s.saveText, { color: onAccent }]}>Simpan</Text>
            </Pressable>
            {editing && (
              <Pressable onPress={onDelete} style={({ pressed }) => [s.deleteBtn, pressed && s.pressed]}
                accessibilityRole="button" accessibilityLabel="Hapus transaksi">
                <Text style={s.deleteText}>Hapus transaksi</Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = (c: Colors) => ({
  root: { flex: 1, backgroundColor: c.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, backgroundColor: c.card,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: c.text },
  headerBtn: { minHeight: MIN_TAP + 4, minWidth: MIN_TAP + 20, paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  headerBtnText: { fontSize: 16, color: c.accent },
  pressed: { backgroundColor: c.pressed },
  body: { padding: 16, paddingBottom: 32, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: c.muted, marginBottom: 8, marginTop: 20 },
  amountBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12,
    borderWidth: 2, paddingHorizontal: 14,
  },
  rp: { fontSize: 22, fontWeight: '800', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 30, fontWeight: '800', paddingVertical: 12, ...amountText },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: MIN_TAP, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, justifyContent: 'center',
    borderColor: c.control, backgroundColor: c.card,
  },
  chipText: { fontSize: 15, color: c.text, fontWeight: '600' },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12,
    borderWidth: 1, borderColor: c.control, padding: 3, gap: 4,
  },
  dateBtn: { width: MIN_TAP + 4, height: MIN_TAP + 4, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dateCenter: { flex: 1, minHeight: MIN_TAP + 4, justifyContent: 'center', borderRadius: 10 },
  dateArrow: { fontSize: 28, color: c.accent, marginTop: -4 },
  dateText: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: c.text },
  noteInput: {
    backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.control,
    paddingHorizontal: 14, minHeight: 52, fontSize: 16, color: c.text,
  },
  saveBtn: { borderRadius: 12, minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  saveText: { fontSize: 16, fontWeight: '800' },
  deleteBtn: { minHeight: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8, borderRadius: 12 },
  deleteText: { color: c.expense, fontSize: 16, fontWeight: '700' },
}) as const;
