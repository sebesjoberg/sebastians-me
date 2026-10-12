import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    typeAware: true,
  },
  categories: {
    correctness: "warn",
  },
  rules: {
    "eslint/no-unused-vars": "error",
  },
});
