import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "src/generated/**", // ✅ abaikan semua file auto-generated Prisma
    ],
  },

  {
    files: ["src/generated/**/*.js"], // khusus file JS di generated
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  {
    rules: {
      // opsional: kalau warning no-unused-expressions sering dipakai (misal isLoggedIn && redirect(...))
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
];

export default eslintConfig;
