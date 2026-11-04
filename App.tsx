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
import { colors } from './src/theme';
import { Transaction } from './src/types';

type Tab = 'home' | 'daily' | 'monthly';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Beranda', icon: '🏠' },
  { key: 'daily', label: 'Harian', icon: '📅' },
  { key: 'monthly', label: 'Bulanan', icon: '📊' },
];

function Main() {
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [date, setDate] = useState(todayKey());
  const [month, setMonth] = useState(monthKeyOf(todayKey()));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const openEdit = (tx: Transaction) => { setEditing(tx); setFormOpen(true); };
  const openAdd = () => { setEditing(null); setFormOpen(true); };

  const title = tab === 'home' ? 'Keuanganku' : tab === 'daily' ? 'Pengeluaran Harian' : 'Laporan Bulanan';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={{ flex: 1 }}>
        {!ready ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
        ) : tab === 'home' ? (
          <HomeScreen onEdit={openEdit} />
        ) : tab === 'daily' ? (
          <DailyScreen date={date} setDate={setDate} onEdit={openEdit} />
        ) : (
          <MonthlyScreen
            month={month}
            setMonth={setMonth}
            onOpenDay={(d) => { setDate(d); setTab('daily'); }}
          />
        )}
      </View>

      <Pressable style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]} onPress={openAdd}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>

      <SafeAreaView edges={['bottom']} style={styles.tabBar}>
        <View style={styles.tabRow}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} style={styles.tabBtn} onPress={() => setTab(t.key)}>
                <Text style={[styles.tabIcon, !active && { opacity: 0.45 }]}>{t.icon}</Text>
                <Text style={[styles.tabLabel, active && { color: colors.primary }]}>{t.label}</Text>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  fab: {
    position: 'absolute', right: 20, bottom: 96, width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  fabText: { color: '#fff', fontSize: 30, fontWeight: '700', marginTop: -2 },
  tabBar: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  tabRow: { flexDirection: 'row', paddingVertical: 8 },
  tabBtn: { flex: 1, alignItems: 'center', gap: 2 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
});
