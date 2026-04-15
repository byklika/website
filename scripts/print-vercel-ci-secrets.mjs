#!/usr/bin/env node
/**
 * Prints VERCEL_ORG_ID and VERCEL_PROJECT_ID from a linked Vercel project
 * (`.vercel/project.json` after `vercel link`). Use to fill GitHub Actions secrets.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const projectFile = join(root, '.vercel', 'project.json');

if (!existsSync(projectFile)) {
  console.error(
    'Missing .vercel/project.json. From the repo root run: vercel link\nThen re-run: pnpm vercel:ci-secrets-hint'
  );
  process.exit(1);
}

let data;
try {
  data = JSON.parse(readFileSync(projectFile, 'utf8'));
} catch {
  console.error('Could not parse .vercel/project.json');
  process.exit(1);
}

const projectId = data.projectId;
const orgId = data.orgId ?? data.teamId;

if (!projectId || !orgId) {
  console.error('.vercel/project.json must include projectId and orgId (or teamId).');
  process.exit(1);
}

console.log(
  'Add these as GitHub repository secrets (Settings → Secrets and variables → Actions):\n'
);
console.log(`VERCEL_ORG_ID=${orgId}`);
console.log(`VERCEL_PROJECT_ID=${projectId}`);
console.log(
  '\nAlso create VERCEL_TOKEN: https://vercel.com/account/tokens (scope: account / deploy access for this team).'
);
