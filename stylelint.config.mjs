/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['**/node_modules/**', '**/dist/**'],
  rules: {
    // Mantine's theme variables use the color key verbatim (e.g. purpleAccent),
    // so allow any --mantine-* name; everything else stays kebab-case.
    'custom-property-pattern': [
      '^(mantine-.+|[a-z][a-z0-9]*(-[a-z0-9]+)*)$',
      { message: 'Expected custom property name to be kebab-case' },
    ],
  },
};
