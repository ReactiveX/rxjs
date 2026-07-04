#!/usr/bin/env bash
# Build rxjs.dev for Firebase Hosting (dist/ + extra-files).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
DOCS="$ROOT/apps/rxjs.dev"
MODE="${FIREBASE_DOCS_MODE:-next}"

cd "$DOCS"

for extra in next stable archive; do
  if [[ ! -d "src/extra-files/$extra" ]]; then
    echo "Missing src/extra-files/$extra — create it (can be empty except for robots.txt)."
    exit 1
  fi
done

if [[ ! -d "src/extra-files/$MODE" ]]; then
  echo "Unknown FIREBASE_DOCS_MODE=$MODE (use next, stable, or archive)."
  exit 1
fi

printf 'Building rxjs.dev (configuration: %s)...\n' "$MODE"
yarn setup
yarn ng build --configuration="$MODE"
cp -rf "src/extra-files/$MODE/." dist/

printf 'Build complete: %s/dist\n' "$DOCS"
