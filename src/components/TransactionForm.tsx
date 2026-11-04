import React, { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoriesFor } from '../categories';
import { addDays, formatNumberInput, relativeDayLabel, todayKey } from '../format';
import { useStore } from '../store';
import { colors } from '../theme';
import { Transaction, TxType } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  editing?: Transaction | null;
  defaultDate?: string;
  defaultType?: TxType;
}

export default function TransactionForm({ visible, onClose, editing, defaultDate, defaultType }: Props) {
  const { save, remove } = useStore();
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayKey());

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setType(editing.type);
      setAmount(formatNumberInput(String(editing.amount)));
      setCategory(editing.category);
      setNote(editing.note);
      setDate(editing.date);
    } else {
      const t = defaultType ?? 'expense';
      setType(t);
      setAmount('');
      setCategory(categoriesFor(t)[0].key);
      setNote('');
      setDate(defaultDate ?? todayKey());
    }
  }, [visible, editing, defaultDate, defaultType]);

  const switchType = (t: TxType) => {
    setType(t);
    if (!categoriesFor(t).some((c) => c.key === category)) setCategory(categoriesFor(t)[0].key);
  };

  const onSave = () => {
    const value = Number(amount.replace(/\D/g, ''));
    if (!value) {
      Alert.alert('Nominal kosong', 'Masukkan jumlah uang terlebih dahulu.');
      return;
    }
    save({ id: editing?.id, type, amount: value, category, note: note.trim(), date });
    onClose();
  };

  const onDelete = () => {
    if (!editing) return;
    Alert.alert('Hapus transaksi?', 'Transaksi ini akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { remove(editing.id); onClose(); } },
    ]);
  };

  const accent = type === 'expense' ? colors.expense : colors.income;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10}><Text style={styles.headerBtn}>Batal</Text></Pressable>
            <Text style={styles.headerTitle}>{editing ? 'Ubah Transaksi' : 'Tambah Transaksi'}</Text>
            <Pressable onPress={onSave} hitSlop={10}><Text style={[styles.headerBtn, { fontWeight: '700' }]}>Simpan</Text></Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
            <View style={styles.toggle}>
              {(['expense', 'income'] as TxType[]).map((t) => {
                const active = t === type;
                const c = t === 'expense' ? colors.expense : colors.income;
                return (
                  <Pressable key={t} onPress={() => switchType(t)} style={[styles.toggleBtn, active && { backgroundColor: c }]}>
                    <Text style={[styles.toggleText, active && { color: '#fff' }]}>
                      {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Jumlah</Text>
            <View style={[styles.amountBox, { borderColor: accent }]}>
              <Text style={[styles.rp, { color: accent }]}>Rp</Text>
              <TextInput
                value={amount}
                onChangeText={(v) => setAmount(formatNumberInput(v))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#94A3B8"
                style={[styles.amountInput, { color: accent }]}
                autoFocus={!editing}
              />
            </View>

            <Text style={styles.label}>Kategori</Text>
            <View style={styles.chips}>
              {categoriesFor(type).map((c) => {
                const active = c.key === category;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => setCategory(c.key)}
                    style={[styles.chip, active && { backgroundColor: c.color, borderColor: c.color }]}
                  >
                    <Text style={[styles.chipText, active && { color: '#fff' }]}>{c.icon} {c.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Tanggal</Text>
            <View style={styles.dateRow}>
              <Pressable style={styles.dateBtn} onPress={() => setDate(addDays(date, -1))}><Text style={styles.dateArrow}>‹</Text></Pressable>
              <Pressable style={{ flex: 1 }} onPress={() => setDate(todayKey())}>
                <Text style={styles.dateText}>{relativeDayLabel(date)}</Text>
              </Pressable>
              <Pressable style={styles.dateBtn} onPress={() => setDate(addDays(date, 1))}><Text style={styles.dateArrow}>›</Text></Pressable>
            </View>

            <Text style={styles.label}>Catatan (opsional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Contoh: Nasi goreng, bensin, gaji bulan ini…"
              placeholderTextColor="#94A3B8"
              style={styles.noteInput}
              maxLength={80}
            />

            <Pressable onPress={onSave} style={[styles.saveBtn, { backgroundColor: accent }]}>
              <Text style={styles.saveText}>Simpan</Text>
            </Pressable>
            {editing && (
              <Pressable onPress={onDelete} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Hapus Transaksi</Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  headerBtn: { fontSize: 16, color: colors.primary },
  toggle: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 14, padding: 4, marginBottom: 18 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  toggleText: { fontWeight: '700', color: colors.muted, fontSize: 15 },
  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 8, marginTop: 4 },
  amountBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 2, paddingHorizontal: 14, marginBottom: 18,
  },
  rp: { fontSize: 22, fontWeight: '800', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 30, fontWeight: '800', paddingVertical: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.card,
  },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14,
    padding: 6, marginBottom: 18,
  },
  dateBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  dateArrow: { fontSize: 26, color: colors.primary, marginTop: -3 },
  dateText: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.text },
  noteInput: {
    backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: colors.text, marginBottom: 24,
  },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  deleteBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  deleteText: { color: colors.expense, fontSize: 15, fontWeight: '700' },
});
