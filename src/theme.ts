import { StyleSheet, useColorScheme } from 'react-native';

const light = {
  bg: '#F6F5F1',
  card: '#FFFFFF',
  text: '#1D1F1E',
  muted: '#5B605C',
  line: '#DEDCD4',
  control: '#8A8E8A',
  accent: '#1E5B43',
  onAccent: '#FFFFFF',
  income: '#1E5B43',
  expense: '#A8321E',
  onExpense: '#FFFFFF',
  pressed: '#ECEAE3',
  warningBg: '#FBEAE6',
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#151716',
  card: '#1E2120',
  text: '#ECEDEA',
  muted: '#A3A8A4',
  line: '#2E3230',
  control: '#6E746F',
  accent: '#7FD1A6',
  onAccent: '#0F1A14',
  income: '#7FD1A6',
  expense: '#FF8A75',
  onExpense: '#0F1A14',
  pressed: '#2A2E2C',
  warningBg: '#3A2420',
};

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

export function useStyles<T>(factory: (c: Colors) => T): T {
  const c = useColors();
  // Sama dengan useMemo per tema, tapi dibagi antar komponen yang memakai factory yang sama.
  return getCached(factory, c) as T;
}

const cache = new WeakMap<object, Map<Colors, unknown>>();
function getCached<T>(factory: (c: Colors) => T, c: Colors): T {
  let byTheme = cache.get(factory);
  if (!byTheme) {
    byTheme = new Map();
    cache.set(factory, byTheme);
  }
  if (!byTheme.has(c)) byTheme.set(c, StyleSheet.create(factory(c) as never));
  return byTheme.get(c) as T;
}

export const MIN_TAP = 44;
export const MAX_CONTENT_WIDTH = 560;
export const amountText = { fontVariant: ['tabular-nums' as const] };
