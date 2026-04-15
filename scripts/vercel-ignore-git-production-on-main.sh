#!/usr/bin/env bash
# Ignored Build Step (see vercel.json → ignoreCommand).
# Exit 0 → skip this Vercel-initiated build. Exit 1 → run the build.
#
# Skip only Production deployments triggered by Vercel’s Git integration for `main`,
# so GitHub Actions can own production deploys without double-shipping.
# Preview deployments (PRs) still build on Vercel unless you rely solely on Actions for previews.

set -euo pipefail

ref="${VERCEL_GIT_COMMIT_REF:-}"

if [[ "${VERCEL_ENV:-}" == "production" ]] && [[ "$ref" == "main" || "$ref" == "refs/heads/main" ]]; then
	echo "Skipping Vercel Git production build for main (production is deployed via GitHub Actions)."
	exit 0
fi

exit 1
