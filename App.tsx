import {
  PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold, useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import app from './app.json';
import TransactionForm from './src/components/TransactionForm';
import { Icon } from './src/components/ui';
import { todayKey } from './src/format';
import CalendarScreen from './src/screens/CalendarScreen';
import HomeScreen from './src/screens/HomeScreen';
import BillForm from './src/screens/settings/BillForm';
import BudgetEditor from './src/screens/settings/BudgetEditor';
import CategoryManager from './src/screens/settings/CategoryManager';
import GoalsScreen from './src/screens/settings/GoalsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StatsScreen from './src/screens/StatsScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import { StoreProvider, useStore } from './src/store';
import { Colors, F, MAX_CONTENT_WIDTH, MIN_TAP, useColors, useStyles } from './src/theme';
import { Bill, Transaction, TxType } from './src/types';

type Tab = 'home' | 'transactions' | 'stats' | 'calendar' | 'settings';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Ringkasan', icon: 'dashboard' },
  { key: 'transactions', label: 'Transaksi', icon: 'receipt-long' },
  { key: 'stats', label: 'Statistik', icon: 'bar-chart' },
  { key: 'calendar', label: 'Kalender', icon: 'calendar-month' },
  { key: 'settings', label: 'Pengaturan', icon: 'settings' },
];

type Sheet = 'budgets' | 'categories' | 'goals' | null;

function Main() {
  const { status, saveError, reload, retrySave } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [tab, setTab] = useState<Tab>('home');
  const [calDate, setCalDate] = useState(todayKey());
  const [form, setForm] = useState<{ editing: Transaction | null; date?: string; type?: TxType } | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [bill, setBill] = useState<Bill | null | undefined>(undefined);

  const current = TABS.find((t) => t.key === tab)!;
  const showFab = status === 'ready' && (tab === 'home' || tab === 'transactions' || tab === 'calendar');

  let content: React.ReactNode;
  if (status === 'loading') {
    content = (
      <View style={s.center}>
        <ActivityIndicator color={c.primary} />
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
    content = (
      <HomeScreen
        onEdit={(tx) => setForm({ editing: tx })}
        onAdd={(type) => setForm({ editing: null, type })}
        onSeeAll={() => setTab('transactions')}
        onManageBudgets={() => setSheet('budgets')}
      />
    );
  } else if (tab === 'transactions') {
    content = <TransactionsScreen onEdit={(tx) => setForm({ editing: tx })} />;
  } else if (tab === 'stats') {
    content = <StatsScreen onManageBudgets={() => setSheet('budgets')} />;
  } else if (tab === 'calendar') {
    content = (
      <CalendarScreen
        selected={calDate}
        setSelected={setCalDate}
        onEdit={(tx) => setForm({ editing: tx })}
        onAddOn={(date) => setForm({ editing: null, date })}
        onEditBill={setBill}
      />
    );
  } else {
    content = (
      <SettingsScreen
        onCategories={() => setSheet('categories')}
        onBudgets={() => setSheet('budgets')}
        onGoals={() => setSheet('goals')}
      />
    );
  }

  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
      <StatusBar style="auto" />
      <View style={s.header}>
        <Image source={require('./assets/icon.png')} style={s.logo} accessible={false} />
        <Text style={s.appName} numberOfLines={1}>{app.expo.name}</Text>
        <Text style={s.slash} importantForAccessibility="no">/</Text>
        <Text style={s.page} accessibilityRole="header" numberOfLines={1}>{current.label}</Text>
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
        {showFab && (
          <Pressable
            style={({ pressed }) => [s.fab, pressed && { opacity: 0.85 }]}
            onPress={() => setForm({ editing: null, date: tab === 'calendar' ? calDate : undefined })}
            accessibilityRole="button"
            accessibilityLabel="Catat transaksi baru"
          >
            <Icon name="add" size={24} color={c.onPrimary} />
            <Text style={s.fabText}>Catat Baru</Text>
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
                style={({ pressed }) => [s.tabBtn, pressed && { opacity: 0.7 }]}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                aria-selected={active}
                accessibilityLabel={t.label}
              >
                <View style={[s.tabPill, active && { backgroundColor: c.iconBg }]}>
                  <Icon name={t.icon} size={22} color={active ? c.primary : c.muted} />
                </View>
                <Text style={[s.tabLabel, active && s.tabLabelActive]} numberOfLines={1}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>

      <TransactionForm
        visible={form !== null}
        onClose={() => setForm(null)}
        editing={form?.editing}
        defaultDate={form?.date}
        defaultType={form?.type}
      />
      <BudgetEditor visible={sheet === 'budgets'} onClose={() => setSheet(null)} />
      <CategoryManager visible={sheet === 'categories'} onClose={() => setSheet(null)} />
      <GoalsScreen visible={sheet === 'goals'} onClose={() => setSheet(null)} />
      <BillForm visible={bill !== undefined} bill={bill ?? null} onClose={() => setBill(undefined)} />
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold, ...MaterialIcons.font,
  });
  // Bila font gagal dimuat, aplikasi tetap jalan dengan font sistem.
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, height: 56,
    backgroundColor: c.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line,
  },
  logo: { width: 28, height: 28, borderRadius: 8 },
  appName: { fontFamily: F.bold, fontSize: 17, color: c.primary, flexShrink: 1 },
  slash: { fontFamily: F.regular, fontSize: 15, color: c.subtle },
  page: { fontFamily: F.semibold, fontSize: 15, color: c.text, flexShrink: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  centerTitle: { fontFamily: F.bold, fontSize: 18, color: c.text, textAlign: 'center' },
  centerText: { fontFamily: F.regular, fontSize: 15, color: c.muted, textAlign: 'center', maxWidth: 360 },
  retryBtn: { backgroundColor: c.primary, minHeight: 48, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  retryText: { fontFamily: F.bold, color: c.onPrimary, fontSize: 16 },
  warning: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.errorBg,
    marginHorizontal: 16, marginTop: 8, paddingLeft: 12, borderRadius: 12,
  },
  warningText: { flex: 1, fontFamily: F.medium, color: c.onErrorBg, fontSize: 14 },
  warningBtn: { minHeight: MIN_TAP, paddingHorizontal: 12, justifyContent: 'center' },
  warningBtnText: { fontFamily: F.bold, color: c.onErrorBg, fontSize: 14, textDecorationLine: 'underline' },
  fab: {
    position: 'absolute', right: 16, bottom: 16, height: 56, paddingLeft: 16, paddingRight: 20, borderRadius: 28,
    backgroundColor: c.primary, flexDirection: 'row', alignItems: 'center', gap: 6,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  fabText: { fontFamily: F.bold, color: c.onPrimary, fontSize: 15 },
  tabBar: { backgroundColor: c.card, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.line },
  tabRow: { flexDirection: 'row', width: '100%', maxWidth: MAX_CONTENT_WIDTH + 80, alignSelf: 'center', paddingVertical: 6 },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 56, gap: 2 },
  tabPill: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontFamily: F.medium, fontSize: 11, color: c.muted },
  tabLabelActive: { fontFamily: F.bold, color: c.primary },
});
