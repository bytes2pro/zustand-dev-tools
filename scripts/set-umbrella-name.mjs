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

const pkgPath = path.join(process.cwd(), 'packages', 'umbrella', 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('Umbrella package.json not found');
  process.exit(1);
}
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = `${scope}/${name}`;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`✔ Umbrella package renamed to ${pkg.name}`);
