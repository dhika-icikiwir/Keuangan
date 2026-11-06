import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AmountInput, Button, Card, Empty, FieldLabel, IconCircle, ModalScreen, ProgressBar, TextField,
} from '../../components/ui';
import { formatNumberInput, formatRupiah, parseNumberInput } from '../../format';
import { useStore } from '../../store';
import { amountText, Colors, F, useColors, useStyles } from '../../theme';
import { Goal } from '../../types';

export default function GoalsScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { goals } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [editing, setEditing] = useState<Goal | 'new' | null>(null);

  return (
    <ModalScreen visible={visible} title="Target tabungan" onClose={onClose} closeLabel="Tutup">
      <Text style={s.note}>
        Catat target seperti dana darurat atau DP rumah, lalu perbarui jumlah yang sudah terkumpul. Target ini terpisah
        dari saldo dan tidak mengubah catatan transaksi.
      </Text>
      <View style={{ gap: 12 }}>
        {goals.length === 0 ? (
          <Card><Empty icon="savings" title="Belum ada target" text="Tambahkan target pertama dengan tombol di bawah." /></Card>
        ) : goals.map((g) => {
          const ratio = g.target ? g.saved / g.target : 0;
          return (
            <Pressable key={g.id} onPress={() => setEditing(g)} style={({ pressed }) => [s.goal, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel={`${g.name}, terkumpul ${formatRupiah(g.saved)} dari ${formatRupiah(g.target)}, ${Math.round(ratio * 100)} persen`}
              accessibilityHint="Ketuk untuk menambah setoran atau mengubah">
              <View style={s.goalTop}>
                <IconCircle name="savings" tone="primary" size={40} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.goalName} numberOfLines={1}>{g.name}</Text>
                  <Text style={s.goalSub}>{formatRupiah(g.saved)} dari {formatRupiah(g.target)}</Text>
                </View>
                <Text style={s.goalPct}>{Math.min(100, Math.round(ratio * 100))}%</Text>
              </View>
              <ProgressBar value={ratio} color={c.primary} />
              {ratio >= 1 && <Text style={s.done}>Target tercapai</Text>}
            </Pressable>
          );
        })}
      </View>
      <View style={{ height: 16 }} />
      <Button label="Tambah target" icon="add-circle" onPress={() => setEditing('new')} />
      <GoalForm visible={editing !== null} goal={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
    </ModalScreen>
  );
}

function GoalForm({ visible, goal, onClose }: { visible: boolean; goal: Goal | null; onClose: () => void }) {
  const { saveGoal, removeGoal } = useStore();
  const s = useStyles(styles);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [deposit, setDeposit] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(goal?.name ?? '');
    setTarget(goal ? formatNumberInput(String(goal.target)) : '');
    setSaved(goal ? formatNumberInput(String(goal.saved)) : '');
    setDeposit('');
  }, [visible, goal]);

  const onSave = () => {
    const t = parseNumberInput(target);
    if (!name.trim() || !t) {
      Alert.alert('Data belum lengkap', 'Isi nama dan jumlah target.');
      return;
    }
    saveGoal({ id: goal?.id, name: name.trim(), target: t, saved: parseNumberInput(saved) + parseNumberInput(deposit) });
    onClose();
  };

  const onDelete = () => {
    if (!goal) return;
    Alert.alert(`Hapus target ${goal.name}?`, 'Target yang dihapus tidak bisa dikembalikan.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => { removeGoal(goal.id); onClose(); } },
    ]);
  };

  return (
    <ModalScreen visible={visible} title={goal ? 'Ubah target' : 'Target baru'} onClose={onClose} onSave={onSave}>
      <FieldLabel>Nama target</FieldLabel>
      <TextField value={name} onChange={setName} label="Nama target" placeholder="Misalnya: Dana darurat" maxLength={40} />
      <FieldLabel>Jumlah target</FieldLabel>
      <AmountInput value={target} onChange={setTarget} label="Jumlah target" />
      <FieldLabel>Sudah terkumpul</FieldLabel>
      <AmountInput value={saved} onChange={setSaved} label="Sudah terkumpul" />
      {goal && (
        <>
          <FieldLabel>Tambah setoran baru</FieldLabel>
          <AmountInput value={deposit} onChange={setDeposit} label="Tambah setoran baru" />
          {parseNumberInput(deposit) > 0 && (
            <Text style={s.after}>Setelah disimpan: {formatRupiah(parseNumberInput(saved) + parseNumberInput(deposit))}</Text>
          )}
        </>
      )}
      <View style={{ height: 24 }} />
      <Button label="Simpan" onPress={onSave} />
      {goal && <View style={{ marginTop: 8 }}><Button label="Hapus target" onPress={onDelete} variant="plain" danger icon="delete" /></View>}
    </ModalScreen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  note: { fontFamily: F.regular, fontSize: 14, color: c.muted, lineHeight: 20, marginBottom: 16 },
  goal: { backgroundColor: c.card, borderRadius: 16, padding: 14, gap: 10, elevation: 1 },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalName: { fontFamily: F.semibold, fontSize: 15, color: c.text },
  goalSub: { fontFamily: F.regular, fontSize: 13, color: c.muted, ...amountText },
  goalPct: { fontFamily: F.bold, fontSize: 15, color: c.primary, ...amountText },
  done: { fontFamily: F.semibold, fontSize: 13, color: c.primary },
  after: { fontFamily: F.medium, fontSize: 13, color: c.muted, marginTop: 6, ...amountText },
});
