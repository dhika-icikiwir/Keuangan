import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { addDays, formatNumberInput, parseNumberInput, relativeDayLabel, todayKey } from '../format';
import { useStore } from '../store';
import { Colors, F, MIN_TAP, useColors, useStyles } from '../theme';
import { Transaction, TxType } from '../types';
import { AmountInput, Button, FieldLabel, Icon, ModalScreen, Segmented, TextField } from './ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  editing?: Transaction | null;
  defaultDate?: string;
  defaultType?: TxType;
}

export default function TransactionForm({ visible, onClose, editing, defaultDate, defaultType }: Props) {
  const { saveTx, removeTx, categories } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayKey());

  const options = categories.filter((x) => x.type === type);

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
      setCategory(categories.find((x) => x.type === t)!.key);
      setNote('');
      setDate(defaultDate ?? todayKey());
    }
  }, [visible, editing, defaultDate, defaultType, categories]);

  const switchType = (t: TxType) => {
    setType(t);
    const list = categories.filter((x) => x.type === t);
    if (!list.some((x) => x.key === category)) setCategory(list[0].key);
  };

  const onSave = () => {
    const value = parseNumberInput(amount);
    if (!value) {
      Alert.alert('Jumlah masih kosong', 'Isi jumlah uangnya dulu.');
      return;
    }
    saveTx({ id: editing?.id, type, amount: value, category, note: note.trim(), date });
    onClose();
  };

  const onDelete = () => {
    if (!editing) return;
    Alert.alert('Hapus transaksi ini?', 'Transaksi yang dihapus tidak bisa dikembalikan.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { removeTx(editing.id); onClose(); } },
    ]);
  };

  const accent = type === 'expense' ? c.expense : c.income;

  return (
    <ModalScreen visible={visible} title={editing ? 'Ubah Transaksi' : 'Catat Transaksi'} onClose={onClose} onSave={onSave} saveLabel="Simpan">
      <Segmented
        label="Jenis transaksi"
        value={type}
        onChange={switchType}
        options={[
          { value: 'expense', label: 'Pengeluaran', icon: 'trending-down' },
          { value: 'income', label: 'Pemasukan', icon: 'trending-up' },
        ]}
      />

      <FieldLabel>Jumlah</FieldLabel>
      <AmountInput value={amount} onChange={setAmount} color={accent} label="Jumlah" autoFocus={!editing} />

      <FieldLabel>Kategori</FieldLabel>
      <View style={s.chips} accessibilityRole="radiogroup" accessibilityLabel="Kategori">
        {options.map((cat) => {
          const active = cat.key === category;
          return (
            <Pressable
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              style={({ pressed }) => [s.chip, active && s.chipActive, pressed && !active && s.pressed]}
              accessibilityRole="radio"
              aria-checked={active}
              accessibilityLabel={cat.label}
            >
              <Icon name={cat.icon} size={18} color={active ? c.onPrimary : c.primary} />
              <Text style={[s.chipText, active && { color: c.onPrimary }]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FieldLabel>Tanggal</FieldLabel>
      <View style={s.dateRow}>
        <Pressable style={({ pressed }) => [s.dateBtn, pressed && s.pressed]} onPress={() => setDate(addDays(date, -1))}
          accessibilityRole="button" accessibilityLabel="Mundur satu hari">
          <Icon name="chevron-left" color={c.text} />
        </Pressable>
        <Pressable style={({ pressed }) => [s.dateCenter, pressed && s.pressed]} onPress={() => setDate(todayKey())}
          accessibilityRole="button" accessibilityLabel={`Tanggal: ${relativeDayLabel(date)}`} accessibilityHint="Ketuk untuk kembali ke hari ini">
          <Text style={s.dateText}>{relativeDayLabel(date)}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [s.dateBtn, pressed && s.pressed]} onPress={() => setDate(addDays(date, 1))}
          accessibilityRole="button" accessibilityLabel="Maju satu hari">
          <Icon name="chevron-right" color={c.text} />
        </Pressable>
      </View>

      <FieldLabel>Catatan (boleh kosong)</FieldLabel>
      <TextField value={note} onChange={setNote} label="Catatan, boleh kosong" placeholder="Misalnya: nasi goreng, bensin" maxLength={80} />

      <View style={{ height: 24 }} />
      <Button label="Simpan" onPress={onSave} />
      {editing && (
        <View style={{ marginTop: 8 }}>
          <Button label="Hapus transaksi" onPress={onDelete} variant="plain" danger icon="delete" />
        </View>
      )}
    </ModalScreen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  pressed: { backgroundColor: c.pressed },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: MIN_TAP, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: c.control,
    backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: c.text },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 14,
    borderWidth: 1, borderColor: c.control, padding: 3, gap: 4,
  },
  dateBtn: { width: MIN_TAP + 4, height: MIN_TAP + 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dateCenter: { flex: 1, minHeight: MIN_TAP + 4, justifyContent: 'center', borderRadius: 12 },
  dateText: { textAlign: 'center', fontFamily: F.bold, fontSize: 16, color: c.text },
});
