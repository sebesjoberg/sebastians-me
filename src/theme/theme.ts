import {
  type CSSVariablesResolver,
  type MantineColorsTuple,
  createTheme,
} from '@mantine/core';

// Primary accent (purple)
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

// Secondary accent (teal) for details
const tealAccent: MantineColorsTuple = [
  '#e6fffa',
  '#b2f5ea',
  '#81e6d9',
  '#4fd1c5',
  '#319795',
  '#2c7a7b',
  '#234e52',
  '#1d4044',
  '#132b2f',
  '#0b191b',
];

export const theme = createTheme({
  colors: {
    purpleAccent,
    tealAccent,
  },
  primaryColor: 'purpleAccent',
  primaryShade: { light: 6, dark: 3 },
});

// Overrides body, text and link colors per color scheme.
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-body': '#f5f7fb',
    '--mantine-color-text': '#0d0f2b',
    '--mantine-color-anchor': '#7048e8',
  },
  dark: {
    '--mantine-color-body': '#0d0e29',
    '--mantine-color-text': '#ffffff',
    '--mantine-color-anchor': '#b197fc',
  },
});
