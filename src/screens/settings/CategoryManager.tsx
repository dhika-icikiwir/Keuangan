import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_ICONS } from '../../categories';
import {
  Button, Card, Divider, FieldLabel, Icon, IconCircle, ListRow, ModalScreen, Segmented, TextField,
} from '../../components/ui';
import { useStore } from '../../store';
import { Colors, F, MIN_TAP, useColors, useStyles } from '../../theme';
import { Category, TxType } from '../../types';

export default function CategoryManager({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { categories, transactions, deleteCategory } = useStore();
  const s = useStyles(styles);
  const [type, setType] = useState<TxType>('expense');
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const list = categories.filter((c) => c.type === type);

  const onDelete = (cat: Category) => {
    const used = transactions.filter((t) => t.category === cat.key).length;
    Alert.alert(
      `Hapus kategori ${cat.label}?`,
      used ? `${used} transaksi dengan kategori ini akan dipindah ke Lainnya.` : 'Belum ada transaksi dengan kategori ini.',
      [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: () => deleteCategory(cat.key) }],
    );
  };

  return (
    <ModalScreen visible={visible} title="Kategori" onClose={onClose} closeLabel="Tutup">
      <Segmented label="Jenis kategori" value={type} onChange={setType}
        options={[{ value: 'expense', label: 'Pengeluaran' }, { value: 'income', label: 'Pemasukan' }]} />
      <Text style={s.note}>Kategori bawaan tidak bisa dihapus. Kategori buatan sendiri bisa diubah dan dihapus.</Text>
      <Card style={s.listCard}>
        {list.map((cat, i) => (
          <View key={cat.key}>
            {i > 0 && <Divider />}
            {cat.custom ? (
              <View style={s.customRow}>
                <View style={{ flex: 1 }}>
                  <ListRow icon={cat.icon} title={cat.label} subtitle="Buatan sendiri" onPress={() => setEditing(cat)} />
                </View>
                <Pressable onPress={() => onDelete(cat)} style={({ pressed }) => [s.delBtn, pressed && s.pressed]}
                  accessibilityRole="button" accessibilityLabel={`Hapus kategori ${cat.label}`}>
                  <DeleteIcon />
                </Pressable>
              </View>
            ) : (
              <ListRow icon={cat.icon} title={cat.label} subtitle="Bawaan" />
            )}
          </View>
        ))}
      </Card>
      <View style={{ height: 16 }} />
      <Button label="Tambah kategori" icon="add-circle" onPress={() => setEditing('new')} />
      <CategoryForm
        visible={editing !== null}
        category={editing === 'new' ? null : editing}
        type={type}
        onClose={() => setEditing(null)}
      />
    </ModalScreen>
  );
}

function DeleteIcon() {
  const c = useColors();
  return <Icon name="delete" color={c.expense} />;
}

function CategoryForm({ visible, category, type, onClose }: {
  visible: boolean; category: Category | null; type: TxType; onClose: () => void;
}) {
  const { saveCategory, categories } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);

  useEffect(() => {
    if (!visible) return;
    setLabel(category?.label ?? '');
    setIcon(category?.icon ?? CATEGORY_ICONS[0]);
  }, [visible, category]);

  const onSave = () => {
    const name = label.trim();
    if (!name) {
      Alert.alert('Nama masih kosong', 'Isi nama kategorinya dulu.');
      return;
    }
    const t = category?.type ?? type;
    if (categories.some((x) => x.type === t && x.label.toLowerCase() === name.toLowerCase() && x.key !== category?.key)) {
      Alert.alert('Nama sudah dipakai', `Sudah ada kategori ${name}.`);
      return;
    }
    saveCategory({ key: category?.key ?? `c-${Date.now()}`, label: name, icon, type: t, custom: true });
    onClose();
  };

  return (
    <ModalScreen visible={visible} title={category ? 'Ubah kategori' : 'Kategori baru'} onClose={onClose} onSave={onSave}>
      <View style={s.preview}>
        <IconCircle name={icon} tone="primary" size={56} />
        <Text style={s.previewText}>{label.trim() || 'Nama kategori'}</Text>
      </View>
      <FieldLabel>Nama</FieldLabel>
      <TextField value={label} onChange={setLabel} label="Nama kategori" placeholder="Misalnya: Kopi, Arisan, Hewan peliharaan" maxLength={30} />
      <FieldLabel>Ikon</FieldLabel>
      <View style={s.icons} accessibilityRole="radiogroup" accessibilityLabel="Ikon kategori">
        {CATEGORY_ICONS.map((name) => {
          const active = name === icon;
          return (
            <Pressable key={name} onPress={() => setIcon(name)}
              style={({ pressed }) => [s.iconBtn, active && s.iconBtnActive, pressed && !active && s.pressed]}
              accessibilityRole="radio" aria-checked={active} accessibilityLabel={`Ikon ${name.replace(/-/g, ' ')}`}>
              <Icon name={name} color={active ? c.onPrimary : c.text} />
            </Pressable>
          );
        })}
      </View>
    </ModalScreen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  pressed: { backgroundColor: c.pressed },
  note: { fontFamily: F.regular, fontSize: 13, color: c.muted, marginVertical: 12 },
  listCard: { padding: 0, paddingVertical: 4, overflow: 'hidden' },
  customRow: { flexDirection: 'row', alignItems: 'center' },
  delBtn: { width: MIN_TAP + 4, height: MIN_TAP + 4, alignItems: 'center', justifyContent: 'center', borderRadius: 24, marginRight: 8 },
  preview: { alignItems: 'center', gap: 8, marginTop: 8 },
  previewText: { fontFamily: F.bold, fontSize: 16, color: c.text },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: c.control,
    alignItems: 'center', justifyContent: 'center', backgroundColor: c.card,
  },
  iconBtnActive: { backgroundColor: c.primary, borderColor: c.primary },
});
