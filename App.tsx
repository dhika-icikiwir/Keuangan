import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TransactionForm from './src/components/TransactionForm';
import { monthKeyOf, todayKey } from './src/format';
import DailyScreen from './src/screens/DailyScreen';
import HomeScreen from './src/screens/HomeScreen';
import MonthlyScreen from './src/screens/MonthlyScreen';
import { StoreProvider, useStore } from './src/store';
import { Colors, MAX_CONTENT_WIDTH, MIN_TAP, useColors, useStyles } from './src/theme';
import { Transaction } from './src/types';

type Tab = 'home' | 'daily' | 'monthly';

const TABS: { key: Tab; label: string; title: string }[] = [
  { key: 'home', label: 'Beranda', title: 'Keuanganku' },
  { key: 'daily', label: 'Harian', title: 'Harian' },
  { key: 'monthly', label: 'Bulanan', title: 'Bulanan' },
];

function Main() {
  const { status, saveError, reload, retrySave } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [tab, setTab] = useState<Tab>('home');
  const [date, setDate] = useState(todayKey());
  const [month, setMonth] = useState(monthKeyOf(todayKey()));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const openEdit = (tx: Transaction) => { setEditing(tx); setFormOpen(true); };
  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const current = TABS.find((t) => t.key === tab)!;

  let content: React.ReactNode;
  if (status === 'loading') {
    content = (
      <View style={s.center}>
        <ActivityIndicator color={c.accent} />
        <Text style={s.centerText}>Memuat catatan…</Text>
      </View>
    );
  } else if (status === 'loadError') {
    content = (
      <View style={s.center}>
        <Text style={s.centerTitle}>Catatan tidak bisa dibuka</Text>
        <Text style={s.centerText}>
          Data di HP tidak terbaca. Catatan lama tidak dihapus, dan pencatatan baru dikunci sampai data berhasil dibuka.
        </Text>
        <Pressable onPress={reload} style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.8 }]}
          accessibilityRole="button" accessibilityLabel="Coba buka lagi">
          <Text style={s.retryText}>Coba buka lagi</Text>
        </Pressable>
      </View>
    );
  } else if (tab === 'home') {
    content = <HomeScreen onEdit={openEdit} />;
  } else if (tab === 'daily') {
    content = <DailyScreen date={date} setDate={setDate} onEdit={openEdit} />;
  } else {
    content = <MonthlyScreen month={month} setMonth={setMonth} onOpenDay={(d) => { setDate(d); setTab('daily'); }} />;
  }

  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
      <StatusBar style="auto" />
      <View style={s.header}>
        <Text style={s.title} accessibilityRole="header">{current.title}</Text>
      </View>

      {saveError && (
        <View style={s.warning} accessibilityRole="alert">
          <Text style={s.warningText}>Perubahan terakhir belum tersimpan di HP.</Text>
          <Pressable onPress={retrySave} style={({ pressed }) => [s.warningBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button" accessibilityLabel="Simpan ulang">
            <Text style={s.warningBtnText}>Simpan ulang</Text>
          </Pressable>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {content}
        {status === 'ready' && (
          <Pressable
            style={({ pressed }) => [s.fab, pressed && { opacity: 0.85 }]}
            onPress={openAdd}
            accessibilityRole="button"
            accessibilityLabel="Catat transaksi baru"
          >
            <Text style={s.fabText}>+ Catat</Text>
          </Pressable>
        )}
      </View>

      <SafeAreaView edges={['bottom']} style={s.tabBar}>
        <View style={s.tabRow} accessibilityRole="tablist">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                style={({ pressed }) => [s.tabBtn, pressed && s.pressed]}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                aria-selected={active}
                accessibilityLabel={t.label}
              >
                <View style={[s.tabIndicator, active && { backgroundColor: c.accent }]} />
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <TransactionForm
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
        defaultDate={tab === 'daily' ? date : todayKey()}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = (c: Colors) => ({
  root: { flex: 1, backgroundColor: c.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, width: '100%', maxWidth: MAX_CONTENT_WIDTH + 32, alignSelf: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: c.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  centerTitle: { fontSize: 18, fontWeight: '700', color: c.text, textAlign: 'center' },
  centerText: { fontSize: 15, color: c.muted, textAlign: 'center', maxWidth: 360 },
  retryBtn: { backgroundColor: c.accent, minHeight: MIN_TAP + 4, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  retryText: { color: c.onAccent, fontWeight: '700', fontSize: 16 },
  warning: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.warningBg,
    marginHorizontal: 16, marginBottom: 8, paddingLeft: 12, borderRadius: 10,
  },
  warningText: { flex: 1, color: c.text, fontSize: 14 },
  warningBtn: { minHeight: MIN_TAP, paddingHorizontal: 12, justifyContent: 'center' },
  warningBtnText: { color: c.expense, fontWeight: '700', fontSize: 14 },
  fab: {
    position: 'absolute', right: 16, bottom: 16, minHeight: 52, paddingHorizontal: 22, borderRadius: 26,
    backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: c.onAccent, fontSize: 17, fontWeight: '800' },
  pressed: { backgroundColor: c.pressed },
  tabBar: { backgroundColor: c.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line },
  tabRow: { flexDirection: 'row', width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  tabBtn: { flex: 1, alignItems: 'center', minHeight: 56, justifyContent: 'center' },
  tabIndicator: { position: 'absolute', top: 0, left: '25%', right: '25%', height: 3, borderRadius: 2 },
  tabLabel: { fontSize: 15, fontWeight: '600', color: c.muted },
  tabLabelActive: { color: c.text, fontWeight: '800' },
}) as const;
