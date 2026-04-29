#!/usr/bin/env node

/**
 * GrowthBook connectivity smoke test:
 * - fetches feature payload for PUBLIC_GROWTHBOOK_CLIENT_KEY
 * - prints active (truthy) feature flags
 * - exits non-zero on invalid setup/response
 */

import fs from "node:fs";
import path from "node:path";

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = stripQuotes(line.slice(separatorIndex + 1));
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const cwd = process.cwd();
loadEnvFile(path.join(cwd, ".env.local"));
loadEnvFile(path.join(cwd, ".env"));

const clientKey = process.env.PUBLIC_GROWTHBOOK_CLIENT_KEY?.trim();

if (!clientKey) {
  console.error("Missing PUBLIC_GROWTHBOOK_CLIENT_KEY environment variable.");
  console.error(
    "Run with: PUBLIC_GROWTHBOOK_CLIENT_KEY=your_key pnpm test:growthbook-flags"
  );
  process.exit(1);
}

const url = `https://cdn.growthbook.io/api/features/${encodeURIComponent(clientKey)}`;

function isTruthyFlagValue(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.length > 0 && value !== "false";
  return Boolean(value);
}

try {
  const response = await fetch(url);

  if (!response.ok) {
    console.error(
      `GrowthBook request failed: ${response.status} ${response.statusText}`
    );
    process.exit(1);
  }

  const payload = await response.json();
  const features = payload?.features;

  if (!features || typeof features !== "object" || Array.isArray(features)) {
    console.error("Invalid GrowthBook payload: expected an object at `features`.");
    process.exit(1);
  }

  const allKeys = Object.keys(features);
  const activeFlags = allKeys.filter((key) =>
    isTruthyFlagValue(features[key]?.defaultValue)
  );

  console.log(`GrowthBook endpoint reachable: ${url}`);
  console.log(`Total feature flags: ${allKeys.length}`);
  console.log(`Active (truthy defaultValue) flags: ${activeFlags.length}`);

  if (activeFlags.length > 0) {
    console.log("\nActive flags:");
    for (const key of activeFlags) {
      const defaultValue = features[key]?.defaultValue;
      console.log(`- ${key} (defaultValue=${JSON.stringify(defaultValue)})`);
    }
  } else {
    console.log(
      "\nNo active truthy defaultValue flags were found. This may be expected."
    );
  }
} catch (error) {
  console.error("GrowthBook test failed:", error);
  process.exit(1);
}
