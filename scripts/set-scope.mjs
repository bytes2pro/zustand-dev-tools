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

const root = process.cwd();
const packagesDir = path.join(root, 'packages');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function detectCurrentScope() {
  if (!fs.existsSync(packagesDir)) return '@rte';
  const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(packagesDir, entry.name, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    try {
      const pkg = readJson(pkgPath);
      if (typeof pkg.name === 'string' && pkg.name.startsWith('@') && pkg.name.includes('/')) {
        return pkg.name.split('/')[0];
      }
    } catch {
      /* ignore: skip unreadable package.json */
    }
  }
  return '@rte';
}

const newScope = params.scope;
if (!newScope) {
  console.error('Usage: node scripts/set-scope.mjs --scope @your-scope');
  process.exit(1);
}

if (!newScope.startsWith('@') || newScope.includes('/')) {
  console.error('Invalid scope. Expected format like "@your-scope"');
  process.exit(1);
}

const currentScope = detectCurrentScope();
if (currentScope === newScope) {
  console.log(`Scope already set to ${newScope}. Nothing to change.`);
  process.exit(0);
}

console.log(`Updating scope: ${currentScope} -> ${newScope}`);

// 1) Update package names in packages/*/package.json
if (fs.existsSync(packagesDir)) {
  for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    // Keep umbrella package scoped to @rte by default; users will rename it via set-umbrella-name
    if (entry.name === 'umbrella') continue;
    const pkgJsonPath = path.join(packagesDir, entry.name, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) continue;
    const pkg = readJson(pkgJsonPath);
    if (typeof pkg.name === 'string' && pkg.name.startsWith(currentScope + '/')) {
      const namePart = pkg.name.split('/')[1];
      pkg.name = `${newScope}/${namePart}`;
      writeJson(pkgJsonPath, pkg);
      console.log(`✔ Updated package name: ${entry.name} -> ${pkg.name}`);
    }
  }
}

// 1b) Update root package.json name
const rootPkgPath = path.join(root, 'package.json');
if (fs.existsSync(rootPkgPath)) {
  try {
    const rootPkg = readJson(rootPkgPath);
    if (typeof rootPkg.name === 'string' && rootPkg.name.startsWith(currentScope + '/')) {
      const namePart = rootPkg.name.split('/')[1];
      rootPkg.name = `${newScope}/${namePart}`;
      writeJson(rootPkgPath, rootPkg);
      console.log(`✔ Updated root package name -> ${rootPkg.name}`);
    }
  } catch {
    /* ignore: skip unreadable root package.json */
  }
}

// 2) Replace references in docs and README
const filesToUpdate = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.git'))
      continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(md|ts|tsx|vue|js|mjs|tsconfig|json)$/i.test(entry.name)) filesToUpdate.push(full);
  }
}

walk(path.join(root, 'docs'));
filesToUpdate.push(path.join(root, 'README.md'));

for (const file of filesToUpdate) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  const replaced = text.replaceAll(`${currentScope}/`, `${newScope}/`);
  if (replaced !== text) {
    fs.writeFileSync(file, replaced);
    console.log(`✔ Updated references in ${path.relative(root, file)}`);
  }
}

// 3) Update scaffold default: it auto-detects scope after this change
console.log('\nDone. New packages you scaffold will default to this scope.');
console.log('Tip: create an npm automation token for this scope and set NPM_TOKEN in CI.');
