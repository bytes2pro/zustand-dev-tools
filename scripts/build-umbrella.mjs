#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const umbrellaDir = path.join(root, 'packages', 'umbrella');
const distDir = path.join(umbrellaDir, 'dist');

const sources = {
  react: path.join(root, 'packages', 'react-ui', 'dist'),
  next: path.join(root, 'packages', 'next-ui', 'dist'),
  nuxt: path.join(root, 'packages', 'nuxt-ui', 'dist'),
  vue: path.join(root, 'packages', 'vue-ui', 'dist'),
  solid: path.join(root, 'packages', 'solid-ui', 'dist'),
  preact: path.join(root, 'packages', 'preact-ui', 'dist'),
  lit: path.join(root, 'packages', 'lit-ui', 'dist'),
  svelte: path.join(root, 'packages', 'svelte-ui', 'dist'),
};

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
  return true;
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

const missing = [];
for (const [key, src] of Object.entries(sources)) {
  const ok = copyDir(src, path.join(distDir, key));
  if (!ok) missing.push(key);
}

if (missing.length) {
  console.warn(
    `Warning: missing framework builds: ${missing.join(', ')}. Run \`pnpm build\` first.`,
  );
}

console.log('✔ Umbrella dist assembled at packages/umbrella/dist');
