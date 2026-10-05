import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Layering rules: roadmap content (src/data) and pure logic (src/lib) must stay
// framework-free so content can be edited without touching UI code.
const frameworkImports = {
  group: ["react", "react-dom", "react/*", "react-dom/*", "next", "next/*"],
  message: "src/data and src/lib are framework-free TypeScript. Keep React/Next code in src/components, src/hooks or src/app.",
};
const uiImports = {
  group: ["@/components/*", "@/app/*", "@/hooks/*"],
  message: "Content and logic must not import UI code. Dependencies point inward: UI -> lib -> data.",
};
const logicImports = {
  group: ["@/lib/*"],
  message: "src/data is plain content: it may only import from src/data (types, helpers, resources).",
};
const serverImports = {
  group: ["@/server/*"],
  message: "src/server holds secrets and database access; only route handlers (src/app/api) may import it.",
};
const serverForbidden = {
  group: ["react", "react-dom", "react/*", "react-dom/*", "@/components/*", "@/hooks/*", "@/app/*"],
  message: "src/server is plain TypeScript for the API: no React and no UI imports.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [frameworkImports, uiImports, serverImports] }],
    },
  },
  {
    files: ["src/data/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [frameworkImports, uiImports, logicImports, serverImports] }],
    },
  },
  {
    files: ["src/server/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [serverForbidden] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
