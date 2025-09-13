#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const params = Object.fromEntries(
  args
    .join(' ')
    .split(/\s+--/)
    .filter(Boolean)
    .map((kv) => {
      const [k, ...rest] = kv.split(' ');
      return [k, rest.join(' ').trim()];
    }),
);

const scope = params.scope;
const name = params.name;

if (!scope || !name) {
  console.error(
    'Usage: node scripts/set-umbrella-name.mjs --scope @your-scope --name your-package',
  );
  process.exit(1);
}
if (!scope.startsWith('@') || scope.includes('/')) {
  console.error('Invalid scope. Expected format like "@your-scope"');
  process.exit(1);
}

const root = process.cwd();
const rootPkgPath = path.join(root, 'package.json');

// 1) Update root package.json name
if (fs.existsSync(rootPkgPath)) {
  try {
    const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
    rootPkg.name = `${scope}/${name}`;
    fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
    console.log(`✔ Root package renamed to ${rootPkg.name}`);
  } catch {
    console.error('Failed to read or write root package.json');
  }
}

// 2) Optionally update umbrella package if present
const umbrellaPkgPath = path.join(root, 'packages', 'umbrella', 'package.json');
if (fs.existsSync(umbrellaPkgPath)) {
  try {
    const umbrellaPkg = JSON.parse(fs.readFileSync(umbrellaPkgPath, 'utf8'));
    umbrellaPkg.name = `${scope}/${name}`;
    fs.writeFileSync(umbrellaPkgPath, JSON.stringify(umbrellaPkg, null, 2) + '\n');
    console.log(`✔ Umbrella package renamed to ${umbrellaPkg.name}`);
  } catch {
    console.error('Failed to read or write packages/umbrella/package.json');
  }
} else {
  console.log('ℹ Umbrella package.json not found; skipped updating umbrella package');
}
