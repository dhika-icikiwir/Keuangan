import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AmountInput, IconCircle, ModalScreen } from '../../components/ui';
import { formatNumberInput, formatRupiah, parseNumberInput } from '../../format';
import { useStore } from '../../store';
import { amountText, Colors, F, useStyles } from '../../theme';

export default function BudgetEditor({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { budgets, setBudgets, categories } = useStore();
  const s = useStyles(styles);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const expenseCats = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (!visible) return;
    const d: Record<string, string> = {};
    for (const [k, v] of Object.entries(budgets)) d[k] = formatNumberInput(String(v));
    setDraft(d);
  }, [visible, budgets]);

  const total = Object.values(draft).reduce((a, v) => a + parseNumberInput(v), 0);

  const onSave = () => {
    const next: Record<string, number> = {};
    for (const [k, v] of Object.entries(draft)) {
      const n = parseNumberInput(v);
      if (n > 0) next[k] = n;
    }
    setBudgets(next);
    onClose();
  };

  return (
    <ModalScreen visible={visible} title="Batas anggaran" onClose={onClose} onSave={onSave}>
      <Text style={s.intro}>
        Isi batas pengeluaran per periode bulanan. Kosongkan kategori yang tidak perlu dibatasi.
      </Text>
      <Text style={s.total}>Total batas: {formatRupiah(total)}</Text>
      <View style={{ gap: 14, marginTop: 12 }}>
        {expenseCats.map((cat) => (
          <View key={cat.key} style={s.row}>
            <View style={s.rowHead}>
              <IconCircle name={cat.icon} size={32} />
              <Text style={s.name}>{cat.label}</Text>
            </View>
            <AmountInput
              value={draft[cat.key] ?? ''}
              onChange={(v) => setDraft((d) => ({ ...d, [cat.key]: v }))}
              label={`Batas ${cat.label}`}
            />
          </View>
        ))}
      </View>
    </ModalScreen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  intro: { fontFamily: F.regular, fontSize: 14, color: c.muted, lineHeight: 20 },
  total: { fontFamily: F.bold, fontSize: 16, color: c.text, marginTop: 10, ...amountText },
  row: { gap: 8 },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontFamily: F.semibold, fontSize: 15, color: c.text },
});
