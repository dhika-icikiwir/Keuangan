import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { formatCompact } from '../format';
import { amountText, Colors, F, useColors, useStyles } from '../theme';
import { useReduceMotion } from './ui';

export interface Slice { key: string; value: number; color: string }

/** Nilai 0 ke 1 (ease-out) yang diputar ulang setiap `trigger` berubah; langsung 1 bila pengguna mengurangi gerakan. */
function useTween(trigger: string, duration: number): number {
  const reduce = useReduceMotion();
  const [t, setT] = useState(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) {
      setT(1);
      return;
    }
    setT(0);
    const start = Date.now();
    let frame = 0;
    const step = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      setT(1 - Math.pow(1 - p, 3));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [trigger, duration, reduce]);
  return t;
}

const SELECTED_EXTRA = 6;

/**
 * Donat dengan celah antar potongan, supaya batas potongan tetap terlihat walau warnanya mirip.
 * Saat tampil, lingkaran tergambar dari kosong dan angka di tengah naik dari 0.
 */
export function Donut({ slices, size = 192, stroke = 22, selected, onSelect, centerPercent, centerBottom, label }: {
  slices: Slice[]; size?: number; stroke?: number; selected?: string; onSelect?: (key: string) => void;
  centerPercent: number | null; centerBottom: string; label: string;
}) {
  const c = useColors();
  const s = useStyles(styles);
  // Jari-jari menyisakan ruang untuk potongan terpilih yang lebih tebal, supaya tidak terpotong tepi gambar.
  const r = (size - stroke - SELECTED_EXTRA) / 2 - 1;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((a, x) => a + x.value, 0);
  const gap = slices.length > 1 ? 3 : 0;
  const ringKey = slices.map((x) => `${x.key}:${x.value}`).join('|');
  const ring = useTween(ringKey, 900);
  const center = useTween(`${ringKey}#${selected}`, 700);
  const drawn = ring * circ;
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }} accessible accessibilityLabel={label}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.container} strokeWidth={stroke} fill="none" />
        {slices.map((x) => {
          const len = total ? (x.value / total) * circ : 0;
          const visible = Math.max(0, Math.min(len - gap, drawn - offset));
          // Offset seperempat lingkaran membuat potongan pertama mulai dari arah jam 12.
          const el = (
            <Circle
              key={x.key}
              cx={size / 2} cy={size / 2} r={r}
              stroke={x.color}
              strokeWidth={selected === x.key ? stroke + SELECTED_EXTRA : stroke}
              strokeDasharray={`${visible} ${circ - visible}`}
              strokeDashoffset={circ / 4 - offset}
              fill="none"
              onPress={onSelect ? () => onSelect(x.key) : undefined}
            />
          );
          offset += len;
          return el;
        })}
      </Svg>
      <View style={s.center} pointerEvents="none">
        <Text style={s.centerTop}>{centerPercent === null ? '' : `${Math.round(centerPercent * center)}%`}</Text>
        <Text style={s.centerBottom} numberOfLines={2}>{centerBottom}</Text>
      </View>
    </View>
  );
}

export interface Bar { label: string; longLabel: string; value: number }

export function BarChart({ bars, onlyPeakValue, label }: { bars: Bar[]; onlyPeakValue?: boolean; label: string }) {
  const c = useColors();
  const s = useStyles(styles);
  const max = Math.max(1, ...bars.map((b) => b.value));
  const peak = bars.reduce((best, b, i) => (b.value > bars[best].value ? i : best), 0);
  return (
    <View accessible accessibilityLabel={label}>
      <View style={s.bars}>
        {bars.map((b, i) => {
          const isPeak = i === peak && b.value > 0;
          return (
            <View key={i} style={s.barCol}>
              <Text style={[s.barValue, isPeak && { color: c.primary, fontFamily: F.bold }]} numberOfLines={1}>
                {b.value > 0 && (!onlyPeakValue || isPeak) ? formatCompact(b.value) : ''}
              </Text>
              <View style={s.barTrack}>
                <View style={[s.bar, { height: `${(b.value / max) * 100}%`, backgroundColor: isPeak ? c.primary : c.bar }]} />
              </View>
              <Text style={[s.barLabel, isPeak && { color: c.primary, fontFamily: F.bold }]} numberOfLines={1}>{b.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = (c: Colors) => StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  centerTop: { fontFamily: F.bold, fontSize: 28, color: c.text, ...amountText },
  centerBottom: { fontFamily: F.medium, fontSize: 13, color: c.muted, textAlign: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 168, gap: 4 },
  barCol: { flex: 1, alignItems: 'center', height: '100%' },
  barValue: { fontFamily: F.medium, fontSize: 11, color: c.muted, height: 16, ...amountText },
  barTrack: { flex: 1, width: '70%', maxWidth: 36, backgroundColor: c.cardAlt, borderTopLeftRadius: 8, borderTopRightRadius: 8, justifyContent: 'flex-end', overflow: 'hidden', marginVertical: 4 },
  bar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  barLabel: { fontFamily: F.medium, fontSize: 12, color: c.muted, height: 18 },
});
