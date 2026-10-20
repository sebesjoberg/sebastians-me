import {
  type CSSVariablesResolver,
  type MantineColorsTuple,
  createTheme,
} from '@mantine/core';

// The one accent. Used only for the active item and links.
const purpleAccent: MantineColorsTuple = [
  '#f3f0ff',
  '#e5dbff',
  '#d0bfff',
  '#b197fc',
  '#9775fa',
  '#845ef7',
  '#7048e8',
  '#5f3dc4',
  '#4c2da7',
  '#3b1e82',
];

const fontFamily = 'Manrope, system-ui, -apple-system, "Segoe UI", sans-serif';

export const theme = createTheme({
  colors: { purpleAccent },
  primaryColor: 'purpleAccent',
  primaryShade: { light: 7, dark: 3 },
  fontFamily,
  headings: { fontFamily, fontWeight: '600' },
  defaultRadius: 'md',
  focusRing: 'auto',
});

// Slate paper and ink in light, deep blue-black ground in dark. The light
// ground is deliberately a shade darker than "white page": a toned paper the
// accent wash and the pictures sit on, not a blank sheet. Dimmed text is a
// steel grey, not a tint of the accent, so the accent stays meaningful.
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-body': '#dfe4ea',
    '--mantine-color-text': '#101922',
    '--mantine-color-dimmed': '#5c6978',
    '--mantine-color-default-border': '#b9c2cc',
    '--mantine-color-anchor': '#5f3dc4',
  },
  dark: {
    '--mantine-color-body': '#0e161e',
    '--mantine-color-default-border': '#273340',
    '--mantine-color-text': '#e8ecf0',
    '--mantine-color-dimmed': '#8a96a3',
    '--mantine-color-anchor': '#b197fc',
  },
});
