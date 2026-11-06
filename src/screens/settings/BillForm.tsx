import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AmountInput, Button, FieldLabel, Icon, ModalScreen, TextField } from '../../components/ui';
import { formatNumberInput, parseNumberInput } from '../../format';
import { useStore } from '../../store';
import { Colors, F, MIN_TAP, useColors, useStyles } from '../../theme';
import { Bill } from '../../types';

export default function BillForm({ visible, bill, onClose }: { visible: boolean; bill: Bill | null; onClose: () => void }) {
  const { saveBill, removeBill, categories } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('tagihan');
  const [dueDay, setDueDay] = useState(1);
  const expenseCats = categories.filter((x) => x.type === 'expense');

  useEffect(() => {
    if (!visible) return;
    setName(bill?.name ?? '');
    setAmount(bill ? formatNumberInput(String(bill.amount)) : '');
    setCategory(bill?.category ?? 'tagihan');
    setDueDay(bill?.dueDay ?? 1);
  }, [visible, bill]);

  const onSave = () => {
    const value = parseNumberInput(amount);
    if (!name.trim() || !value) {
      Alert.alert('Data belum lengkap', 'Isi nama dan jumlah tagihan.');
      return;
    }
    saveBill({ id: bill?.id, name: name.trim(), amount: value, category, dueDay, paid: bill?.paid });
    onClose();
  };

  const onDelete = () => {
    if (!bill) return;
    Alert.alert(`Hapus tagihan ${bill.name}?`, 'Transaksi pembayaran yang sudah dicatat tidak ikut terhapus.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { removeBill(bill.id); onClose(); } },
    ]);
  };

  return (
    <ModalScreen visible={visible} title={bill ? 'Ubah tagihan' : 'Tagihan rutin baru'} onClose={onClose} onSave={onSave}>
      <FieldLabel>Nama tagihan</FieldLabel>
      <TextField value={name} onChange={setName} label="Nama tagihan" placeholder="Misalnya: Listrik, Internet, Kos" maxLength={40} />
      <FieldLabel>Jumlah per bulan</FieldLabel>
      <AmountInput value={amount} onChange={setAmount} label="Jumlah per bulan" />

      <FieldLabel>Jatuh tempo tiap tanggal</FieldLabel>
      <View style={s.days} accessibilityRole="radiogroup" accessibilityLabel="Tanggal jatuh tempo">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
          const active = d === dueDay;
          return (
            <Pressable key={d} onPress={() => setDueDay(d)}
              style={({ pressed }) => [s.day, active && s.dayActive, pressed && !active && s.pressed]}
              accessibilityRole="radio" aria-checked={active} accessibilityLabel={`Tanggal ${d}`}>
              <Text style={[s.dayText, active && { color: c.onPrimary, fontFamily: F.bold }]}>{d}</Text>
            </Pressable>
          );
        })}
      </View>
      {dueDay > 28 && <Text style={s.hint}>Di bulan yang lebih pendek, jatuh tempo dipindah ke tanggal terakhir bulan itu.</Text>}

      <FieldLabel>Kategori saat dicatat lunas</FieldLabel>
      <View style={s.chips} accessibilityRole="radiogroup" accessibilityLabel="Kategori">
        {expenseCats.map((cat) => {
          const active = cat.key === category;
          return (
            <Pressable key={cat.key} onPress={() => setCategory(cat.key)}
              style={({ pressed }) => [s.chip, active && s.chipActive, pressed && !active && s.pressed]}
              accessibilityRole="radio" aria-checked={active} accessibilityLabel={cat.label}>
              <Icon name={cat.icon} size={18} color={active ? c.onPrimary : c.primary} />
              <Text style={[s.chipText, active && { color: c.onPrimary }]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 24 }} />
      <Button label="Simpan" onPress={onSave} />
      {bill && <View style={{ marginTop: 8 }}><Button label="Hapus tagihan" onPress={onDelete} variant="plain" danger icon="delete" /></View>}
    </ModalScreen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  pressed: { backgroundColor: c.pressed },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  day: {
    width: '13%', minWidth: MIN_TAP, height: MIN_TAP, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.card, borderWidth: 1, borderColor: c.line,
  },
  dayActive: { backgroundColor: c.primary, borderColor: c.primary },
  dayText: { fontFamily: F.medium, fontSize: 15, color: c.text },
  hint: { fontFamily: F.regular, fontSize: 13, color: c.muted, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: MIN_TAP, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: c.control,
    backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { fontFamily: F.semibold, fontSize: 14, color: c.text },
});
