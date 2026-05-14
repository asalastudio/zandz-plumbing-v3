import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".claude/**",
      ".next/**",
      ".playwright-cli/**",
      ".vercel/**",
      "node_modules/**",
      "out/**",
      "output/**",
      "public/**",
      "scripts/**",
      "_docs/**",
    ],
  },
];

export default config;
