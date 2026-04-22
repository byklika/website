#!/usr/bin/env node
/**
 * After `astro build`, prints per-file and total size of emitted CSS under `dist/_astro/`.
 * Use: `pnpm css:measure` (runs build then this script).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(root, '..', 'dist', '_astro');

if (!fs.existsSync(distDir)) {
  console.error('Expected dist/_astro after build — directory missing:', distDir);
  process.exit(1);
}

const files = fs.readdirSync(distDir).filter((f) => f.endsWith('.css'));
if (!files.length) {
  console.error('No .css files found in', distDir);
  process.exit(1);
}

let total = 0;
for (const f of files.sort()) {
  const bytes = fs.statSync(path.join(distDir, f)).size;
  total += bytes;
  console.log(`${f}\t${(bytes / 1024).toFixed(1)} KiB`);
}
console.log(`---\nTotal (${files.length} files):\t${(total / 1024).toFixed(1)} KiB`);
