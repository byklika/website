#!/usr/bin/env node

/**
 * GrowthBook connectivity smoke test:
 * - fetches feature payload for PUBLIC_GROWTHBOOK_CLIENT_KEY
 * - prints active (truthy) feature flags
 * - prints experiment-related data from the same payload:
 *   - top-level `experiments` (visual / URL auto-experiments) when present
 *   - feature `rules` that define A/B tests (non-empty `variations` array)
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

function isExperimentLikeRule(rule) {
  if (!rule || typeof rule !== "object") return false;
  const v = rule.variations;
  return Array.isArray(v) && v.length > 0;
}

/** @param {Record<string, { defaultValue?: unknown; rules?: unknown[] }>} features */
function collectFeatureRuleExperiments(features) {
  const out = [];
  for (const [featureId, def] of Object.entries(features)) {
    const rules = Array.isArray(def?.rules) ? def.rules : [];
    rules.forEach((rule, ruleIndex) => {
      if (!isExperimentLikeRule(rule)) return;
      const experimentKey =
        typeof rule.key === "string" && rule.key.trim() ? rule.key : featureId;
      out.push({
        featureId,
        ruleIndex,
        ruleId: typeof rule.id === "string" ? rule.id : "",
        experimentKey,
        name: typeof rule.name === "string" ? rule.name : "",
        variationCount: rule.variations.length,
        coverage: typeof rule.coverage === "number" ? rule.coverage : null,
        weights: Array.isArray(rule.weights) ? rule.weights : null,
        hashAttribute:
          typeof rule.hashAttribute === "string" ? rule.hashAttribute : null,
        hasCondition: Boolean(rule.condition),
        /** When set, this rule forces a value and skips traffic split. */
        forcedToValue: Object.prototype.hasOwnProperty.call(rule, "force")
          ? rule.force
          : undefined,
        /** Payload may include `active: false` on experiment-style rules. */
        active: rule.active !== false,
      });
    });
  }
  return out;
}

function printTopLevelExperiments(experiments) {
  const list = Array.isArray(experiments) ? experiments : [];
  console.log(
    `\nTop-level \`experiments\` (visual / URL auto-experiments): ${list.length}`
  );
  if (list.length === 0) {
    console.log("(none — typical for feature-flag-only SDK connections.)");
    return;
  }
  for (let i = 0; i < list.length; i++) {
    const ex = list[i];
    const n = Array.isArray(ex?.variations) ? ex.variations.length : 0;
    const active = ex?.active !== false;
    const cov =
      typeof ex?.coverage === "number" ? ` coverage=${ex.coverage}` : "";
    console.log(
      `- [${i}] key=${ex?.key ?? "?"} name=${ex?.name ?? ""} variations=${n} active=${active}${cov}`
    );
  }
}

function printFeatureRuleExperiments(rows) {
  console.log(`\nA/B rules on features (rules with \`variations\`): ${rows.length}`);
  if (rows.length === 0) {
    console.log(
      "(none — no feature rules with a non-empty `variations` array in this payload.)"
    );
    return;
  }
  for (const r of rows) {
    const weightsStr =
      r.weights && r.weights.length ? ` weights=${JSON.stringify(r.weights)}` : "";
    const coverageStr = r.coverage != null ? ` coverage=${r.coverage}` : "";
    const forcedStr =
      r.forcedToValue !== undefined
        ? ` FORCED=${JSON.stringify(r.forcedToValue)} (skips split)`
        : "";
    const condStr = r.hasCondition ? " targeting=yes" : "";
    const hashStr = r.hashAttribute ? ` hashAttribute=${r.hashAttribute}` : "";
    const activeStr = r.active ? "" : " active=false";
    const idStr = r.ruleId ? ` ruleId=${r.ruleId}` : "";
    console.log(
      `- feature=${r.featureId} rule#${r.ruleIndex}${idStr} experimentKey=${r.experimentKey}${r.name ? ` (${r.name})` : ""} variations=${r.variationCount}${coverageStr}${weightsStr}${hashStr}${condStr}${forcedStr}${activeStr}`
    );
  }
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

  if (payload?.dateUpdated) {
    console.log(`API payload dateUpdated: ${payload.dateUpdated}`);
  }

  if (payload?.encryptedExperiments) {
    console.log(
      "\nNote: response includes `encryptedExperiments`; listing those requires a decryption key (not used in this script)."
    );
  }

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

  printTopLevelExperiments(payload?.experiments);

  const experimentRules = collectFeatureRuleExperiments(features);
  printFeatureRuleExperiments(experimentRules);
} catch (error) {
  console.error("GrowthBook test failed:", error);
  process.exit(1);
}
