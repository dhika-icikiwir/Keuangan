import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { findCategory } from '../categories';
import { BarChart, Donut } from '../components/Charts';
import { Button, Card, ChangeNote, Empty, IconCircle, Navigator, ProgressBar, Screen, Segmented } from '../components/ui';
import { formatRupiah, percentChange, todayKey } from '../format';
import { bucketsOf, inPeriod, periodOf, PeriodKind, shiftAnchor } from '../periods';
import { useStore } from '../store';
import { amountText, Colors, F, useColors, useStyles } from '../theme';
import { TxType } from '../types';

const UNIT: Record<PeriodKind, string> = { week: 'hari', month: 'minggu', year: 'bulan' };
const OTHERS = '__lainnya__';

export default function StatsScreen({ onManageBudgets }: { onManageBudgets: () => void }) {
  const { transactions, settings, categories, budgets } = useStore();
  const s = useStyles(styles);
  const c = useColors();
  const [flow, setFlow] = useState<TxType>('expense');
  const [kind, setKind] = useState<PeriodKind>('month');
  const [anchor, setAnchor] = useState(todayKey());
  const [picked, setPicked] = useState<string | null>(null);
  const startDay = settings.cycleStartDay;

  const period = periodOf(kind, anchor, startDay);
  const prev = periodOf(kind, shiftAnchor(kind, anchor, -1, startDay), startDay);

  const list = useMemo(
    () => transactions.filter((t) => t.type === flow && inPeriod(t, period)),
    [transactions, flow, period.start, period.end],
  );
  const prevList = useMemo(
    () => transactions.filter((t) => t.type === flow && inPeriod(t, prev)),
    [transactions, flow, prev.start, prev.end],
  );
  const total = list.reduce((a, t) => a + t.amount, 0);
  const prevTotal = prevList.reduce((a, t) => a + t.amount, 0);

  const byCat = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of list) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [list]);

  // Lima warna cukup untuk dibedakan; kategori ke-5 dan seterusnya digabung.
  const rows = byCat.length > 5
    ? [...byCat.slice(0, 4), [OTHERS, byCat.slice(4).reduce((a, [, v]) => a + v, 0)] as [string, number]]
    : byCat;
  const slices = rows.map(([key, value], i) => ({ key, value, color: c.chart[i] }));
  const selectedKey = picked && rows.some(([k]) => k === picked) ? picked : rows[0]?.[0];
  const labelOf = (key: string) => (key === OTHERS ? `${byCat.length - 4} kategori lain` : findCategory(categories, key).label);
  const selectedRow = rows.find(([k]) => k === selectedKey);
  const pctOf = (v: number) => (total ? Math.round((v / total) * 100) : 0);

  const buckets = bucketsOf(kind, period);
  const bars = buckets.map((b) => ({
    label: b.label,
    longLabel: b.longLabel,
    value: list.filter((t) => t.date >= b.start && t.date <= b.end).reduce((a, t) => a + t.amount, 0),
  }));
  const avg = total / buckets.length;

  const insight = useMemo(() => {
    if (flow !== 'expense') return null;
    const prevByCat = new Map<string, number>();
    for (const t of prevList) prevByCat.set(t.category, (prevByCat.get(t.category) ?? 0) + t.amount);
    let best: { key: string; pct: number; cur: number; before: number } | null = null;
    for (const [key, cur] of byCat) {
      const before = prevByCat.get(key) ?? 0;
      const pct = percentChange(cur, before);
      if (pct !== null && pct >= 10 && (!best || pct > best.pct)) best = { key, pct, cur, before };
    }
    return best;
  }, [flow, byCat, prevList]);

  const flowWord = flow === 'expense' ? 'pengeluaran' : 'pemasukan';

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Segmented
          label="Jenis"
          value={flow}
          onChange={(v) => { setFlow(v); setPicked(null); }}
          options={[
            { value: 'expense', label: 'Pengeluaran', icon: 'trending-down' },
            { value: 'income', label: 'Pemasukan', icon: 'trending-up' },
          ]}
        />
        <Segmented
          small
          label="Rentang waktu"
          value={kind}
          onChange={(v) => { setKind(v); setAnchor(todayKey()); setPicked(null); }}
          options={[
            { value: 'week', label: 'Minggu' },
            { value: 'month', label: 'Bulan' },
            { value: 'year', label: 'Tahun' },
          ]}
        />
      </View>

      <Card style={{ gap: 12 }}>
        <Navigator
          label={period.label}
          prevLabel={`${kind === 'week' ? 'Minggu' : kind === 'year' ? 'Tahun' : 'Periode'} sebelumnya`}
          nextLabel={`${kind === 'week' ? 'Minggu' : kind === 'year' ? 'Tahun' : 'Periode'} berikutnya`}
          onPrev={() => { setAnchor(shiftAnchor(kind, anchor, -1, startDay)); setPicked(null); }}
          onNext={() => { setAnchor(shiftAnchor(kind, anchor, 1, startDay)); setPicked(null); }}
        />
        <View>
          <Text style={s.totalLabel}>Total {flowWord}</Text>
          <Text style={[s.totalValue, flow === 'income' && { color: c.income }]}>{formatRupiah(total)}</Text>
          <ChangeNote pct={percentChange(total, prevTotal)} goodWhenDown={flow === 'expense'} compareLabel={prev.compareLabel} />
        </View>
      </Card>

      {total === 0 ? (
        <Card>
          <Empty icon="pie-chart" title={`Belum ada ${flowWord}`} text={`Tidak ada ${flowWord} di ${period.label}. Pindah ke periode lain dengan tombol panah.`} />
        </Card>
      ) : (
        <>
          <Card style={{ gap: 16 }}>
            <View style={s.cardTitleRow}>
              <Text style={s.cardTitle} accessibilityRole="header">Pembagian per kategori</Text>
              <Text style={s.cardMeta}>{byCat.length} kategori</Text>
            </View>
            <Donut
              slices={slices}
              selected={selectedKey}
              onSelect={setPicked}
              centerPercent={selectedRow ? pctOf(selectedRow[1]) : null}
              centerBottom={selectedRow ? labelOf(selectedRow[0]) : ''}
              label={`Grafik donat ${flowWord} per kategori. ${rows.map(([k, v]) => `${labelOf(k)} ${pctOf(v)} persen`).join(', ')}`}
            />
            <View style={{ gap: 4 }}>
              {rows.map(([key, value], i) => {
                const cat = key === OTHERS ? null : findCategory(categories, key);
                const active = key === selectedKey;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setPicked(key)}
                    style={({ pressed }) => [s.catRow, active && s.catRowActive, pressed && !active && s.pressed]}
                    accessibilityRole="button"
                    aria-selected={active}
                    accessibilityLabel={`${labelOf(key)}, ${formatRupiah(value)}, ${pctOf(value)} persen`}
                  >
                    <IconCircle name={cat ? cat.icon : 'more-horiz'} size={36} />
                    <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
                      <Text style={s.catName} numberOfLines={1}>{labelOf(key)}</Text>
                      <ProgressBar value={value / total} color={c.chart[i]} />
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.catValue}>{formatRupiah(value)}</Text>
                      <Text style={s.catPct}>{pctOf(value)}%</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card style={{ gap: 12 }}>
            <View>
              <Text style={s.cardTitle} accessibilityRole="header">{flow === 'expense' ? 'Pengeluaran' : 'Pemasukan'} per {UNIT[kind]}</Text>
              <Text style={s.cardMeta}>Rata-rata {formatRupiah(avg)} per {UNIT[kind]}</Text>
            </View>
            <BarChart
              bars={bars}
              onlyPeakValue={kind === 'year'}
              label={`Grafik ${flowWord} per ${UNIT[kind]}. ${bars.map((b) => `${b.longLabel}: ${formatRupiah(b.value)}`).join(', ')}`}
            />
          </Card>

          {insight && (
            <View style={s.insight}>
              <View style={s.insightHead}>
                <IconCircle name="insights" tone="primary" size={36} />
                <Text style={s.insightTitle}>Kategori yang paling naik</Text>
              </View>
              <Text style={s.insightText}>
                {labelOf(insight.key)} naik {insight.pct}% dibanding {prev.compareLabel}: {formatRupiah(insight.before)} menjadi {formatRupiah(insight.cur)}.
                {budgets[insight.key] ? ` Batas anggarannya ${formatRupiah(budgets[insight.key])}.` : ' Kategori ini belum punya batas anggaran.'}
              </Text>
              <Button label={budgets[insight.key] ? 'Ubah batas anggaran' : 'Atur batas anggaran'} onPress={onManageBudgets} variant="soft" />
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  pressed: { backgroundColor: c.pressed },
  totalLabel: { fontFamily: F.medium, fontSize: 13, color: c.muted },
  totalValue: { fontFamily: F.bold, fontSize: 28, color: c.text, marginVertical: 2, ...amountText },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontFamily: F.bold, fontSize: 17, color: c.text, flexShrink: 1 },
  cardMeta: { fontFamily: F.medium, fontSize: 13, color: c.muted, ...amountText },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 12, minHeight: 56 },
  catRowActive: { backgroundColor: c.cardAlt },
  catName: { fontFamily: F.semibold, fontSize: 14, color: c.text },
  catValue: { fontFamily: F.bold, fontSize: 14, color: c.text, ...amountText },
  catPct: { fontFamily: F.semibold, fontSize: 12, color: c.muted, ...amountText },
  insight: { backgroundColor: c.cardAlt, borderRadius: 16, padding: 16, gap: 10 },
  insightHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  insightTitle: { fontFamily: F.bold, fontSize: 15, color: c.text },
  insightText: { fontFamily: F.regular, fontSize: 14, lineHeight: 21, color: c.muted, ...amountText },
});
