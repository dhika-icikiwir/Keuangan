import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import app from '../../app.json';
import { Card, Divider, ListRow, ModalScreen, Screen } from '../components/ui';
import { formatDate, formatRupiah } from '../format';
import { useStore } from '../store';
import { Colors, F, MIN_TAP, useColors, useStyles } from '../theme';

interface Props {
  onCategories: () => void;
  onBudgets: () => void;
  onGoals: () => void;
}

export default function SettingsScreen({ onCategories, onBudgets, onGoals }: Props) {
  const { transactions, customCategories, goals, budgets, settings, updateSettings } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [cycleOpen, setCycleOpen] = useState(false);
  const budgetTotal = Object.values(budgets).reduce((a, v) => a + v, 0);
  const oldest = transactions.length ? transactions[transactions.length - 1].date : null;

  return (
    <Screen>
      <Card style={s.appCard}>
        <Image source={require('../../assets/icon.png')} style={s.appIcon} accessibilityIgnoresInvertColors accessible={false} />
        <View style={{ flex: 1 }}>
          <Text style={s.appName}>{app.expo.name}</Text>
          <Text style={s.appSub}>
            {transactions.length ? `${transactions.length} catatan sejak ${formatDate(oldest!)}` : 'Belum ada catatan'}
          </Text>
        </View>
      </Card>
      <View style={s.notice}>
        <Text style={s.noticeText}>
          Semua catatan hanya tersimpan di HP ini. Kalau aplikasi dihapus atau HP direset, catatan ikut hilang.
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={s.group} accessibilityRole="header">Keuangan</Text>
        <Card style={s.listCard}>
          <ListRow icon="category" title="Kategori"
            subtitle={customCategories.length ? `${customCategories.length} buatan sendiri` : 'Tambah kategori sendiri'} onPress={onCategories} />
          <Divider />
          <ListRow icon="tune" title="Batas anggaran bulanan"
            subtitle={budgetTotal ? `Total ${formatRupiah(budgetTotal)}` : 'Belum diatur'} onPress={onBudgets} />
          <Divider />
          <ListRow icon="savings" title="Target tabungan" subtitle={goals.length ? `${goals.length} target` : 'Belum ada target'} onPress={onGoals} />
        </Card>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={s.group} accessibilityRole="header">Preferensi</Text>
        <Card style={s.listCard}>
          <ListRow icon="event" title="Mulai periode bulanan"
            subtitle={`Tanggal ${settings.cycleStartDay}. Bisa disamakan dengan tanggal gajian`} onPress={() => setCycleOpen(true)} />
          <Divider />
          {/* Seluruh baris jadi sakelar supaya area sentuhnya besar; Switch hanya penanda visual. */}
          <Pressable
            onPress={() => updateSettings({ hideBalance: !settings.hideBalance })}
            style={({ pressed }) => pressed && s.pressed}
            accessibilityRole="switch"
            aria-checked={settings.hideBalance}
            accessibilityLabel="Sembunyikan saldo"
          >
            <ListRow icon="visibility-off" title="Sembunyikan saldo" subtitle="Saldo di Ringkasan diganti titik-titik">
              <View pointerEvents="none" aria-hidden importantForAccessibility="no-hide-descendants">
                <Switch
                  value={settings.hideBalance}
                  trackColor={{ true: c.primary, false: c.control }}
                  thumbColor="#F2F3FF"
                />
              </View>
            </ListRow>
          </Pressable>
        </Card>
      </View>

      <Text style={s.version}>{app.expo.name} versi {app.expo.version}</Text>

      <CyclePicker visible={cycleOpen} value={settings.cycleStartDay} onClose={() => setCycleOpen(false)}
        onPick={(d) => { updateSettings({ cycleStartDay: d }); setCycleOpen(false); }} />
    </Screen>
  );
}

function CyclePicker({ visible, value, onClose, onPick }: {
  visible: boolean; value: number; onClose: () => void; onPick: (d: number) => void;
}) {
  const s = useStyles(styles);
  const c = useColors();
  return (
    <ModalScreen visible={visible} title="Mulai periode bulanan" onClose={onClose}>
      <Text style={s.pickerNote}>
        Periode bulanan dimulai di tanggal ini. Contoh: tanggal 25 berarti periode November berjalan 25 November sampai 24 Desember.
        Dipakai di Ringkasan, Transaksi, Statistik, dan pos anggaran.
      </Text>
      <View style={s.days} accessibilityRole="radiogroup" accessibilityLabel="Tanggal mulai">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => {
          const active = d === value;
          return (
            <Pressable key={d} onPress={() => onPick(d)}
              style={({ pressed }) => [s.day, active && s.dayActive, pressed && !active && s.pressed]}
              accessibilityRole="radio" aria-checked={active} accessibilityLabel={`Tanggal ${d}`}>
              <Text style={[s.dayText, active && { color: c.onPrimary, fontFamily: F.bold }]}>{d}</Text>
            </Pressable>
          );
        })}
      </View>
    </ModalScreen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  pressed: { backgroundColor: c.pressed },
  appCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  appIcon: { width: 56, height: 56, borderRadius: 14 },
  appName: { fontFamily: F.bold, fontSize: 18, color: c.text },
  appSub: { fontFamily: F.regular, fontSize: 13, color: c.muted, marginTop: 2 },
  notice: { backgroundColor: c.cardAlt, borderRadius: 14, padding: 14 },
  noticeText: { fontFamily: F.regular, fontSize: 13, color: c.muted, lineHeight: 19 },
  group: { fontFamily: F.bold, fontSize: 15, color: c.muted, paddingHorizontal: 4 },
  listCard: { padding: 0, paddingVertical: 4, overflow: 'hidden' },
  version: { fontFamily: F.medium, fontSize: 13, color: c.subtle, textAlign: 'center', marginTop: 8 },
  pickerNote: { fontFamily: F.regular, fontSize: 14, color: c.muted, lineHeight: 20, marginBottom: 16 },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  day: {
    width: MIN_TAP + 2, height: MIN_TAP + 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: c.card, borderWidth: 1, borderColor: c.line,
  },
  dayActive: { backgroundColor: c.primary, borderColor: c.primary },
  dayText: { fontFamily: F.medium, fontSize: 15, color: c.text },
});
