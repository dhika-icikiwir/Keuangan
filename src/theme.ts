import { useColorScheme } from 'react-native';

const light = {
  bg: '#FAF8FF',
  card: '#FFFFFF',
  cardAlt: '#F2F3FF',
  container: '#EAEDFF',
  text: '#131B2E',
  muted: '#3D4A42',
  subtle: '#5E6A63',
  line: '#E2E7F5',
  control: '#6D7A72',
  primary: '#006948',
  onPrimary: '#FFFFFF',
  onPrimarySoft: '#D3EEE2',
  iconBg: '#DDF5EA',
  income: '#006948',
  expense: '#BA1A1A',
  onExpense: '#FFFFFF',
  errorBg: '#FFDAD6',
  onErrorBg: '#93000A',
  pressed: '#E6E9F7',
  bar: '#5E8C78',
  chart: ['#006948', '#3F5E8C', '#00402C', '#7A5C2E', '#5A6478'],
};

export type Colors = typeof light;

const dark: Colors = {
  bg: '#0F1420',
  card: '#191F2C',
  cardAlt: '#222A3A',
  container: '#2A3244',
  text: '#E2E6F3',
  muted: '#B4C0B8',
  subtle: '#98A49C',
  line: '#2A3244',
  control: '#8A958E',
  primary: '#68DBA9',
  onPrimary: '#003325',
  onPrimarySoft: '#004D37',
  iconBg: '#1E3A2F',
  income: '#68DBA9',
  expense: '#FFB4AB',
  onExpense: '#3A0905',
  errorBg: '#93000A',
  onErrorBg: '#FFDAD6',
  pressed: '#2A3244',
  bar: '#4E9C7C',
  chart: ['#68DBA9', '#7FB2E5', '#A6F0CB', '#D9B26C', '#8E9AB8'],
};

export function useColors(): Colors {
  return useColorScheme() === 'dark' ? dark : light;
}

const cache = new WeakMap<object, Map<Colors, unknown>>();

export function useStyles<T>(factory: (c: Colors) => T): T {
  const c = useColors();
  let byTheme = cache.get(factory);
  if (!byTheme) {
    byTheme = new Map();
    cache.set(factory, byTheme);
  }
  if (!byTheme.has(c)) byTheme.set(c, factory(c));
  return byTheme.get(c) as T;
}

export const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const MIN_TAP = 44;
export const MAX_CONTENT_WIDTH = 560;
export const amountText = { fontVariant: ['tabular-nums' as const] };
