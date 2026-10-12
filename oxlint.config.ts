import { oxlint } from 'oxc-config-mantine';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [oxlint],
  options: {
    typeAware: true,
  },
  categories: {
    correctness: 'warn',
  },
  rules: {
    'eslint/no-unused-vars': 'error',
  },
});
