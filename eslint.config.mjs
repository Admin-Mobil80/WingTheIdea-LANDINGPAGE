import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // The CDK app is a separate TS project with its own toolchain, and
    // cdk.out holds synthesized bundles of third-party Lambda assets.
    "infra/cdk.out/**",
    "infra/node_modules/**",
  ]),
]);

export default eslintConfig;
