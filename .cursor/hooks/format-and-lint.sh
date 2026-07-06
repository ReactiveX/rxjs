#!/usr/bin/env bash
# Post-edit formatter: runs eslint --fix and prettier --write on agent-edited files.
# Always exits 0 so lint/format issues never block the agent.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ESLINT="$ROOT/node_modules/.bin/eslint"
PRETTIER="$ROOT/node_modules/.bin/prettier"

input="$(cat)"
file_path="$(echo "$input" | jq -r '.file_path // empty')"

if [[ -z "$file_path" ]]; then
  exit 0
fi

# Normalize to an absolute path under the repo when possible.
if [[ "$file_path" != /* ]]; then
  file_path="$ROOT/$file_path"
fi

# Only process files inside this repository.
case "$file_path" in
  "$ROOT"/*) ;;
  *) exit 0 ;;
esac

rel="${file_path#"$ROOT"/}"

# Skip generated, vendored, and non-source paths.
case "$rel" in
  node_modules/* | dist/* | .yarn/* | yarn.lock | package-lock.json | *.min.js | *.min.css)
    exit 0
    ;;
esac

run_quietly() {
  "$@" >/dev/null 2>&1 || true
}

case "$rel" in
  *.ts | *.tsx | *.js | *.jsx)
    if [[ -x "$ESLINT" ]]; then
      run_quietly "$ESLINT" --fix "$file_path"
    fi
  ;;
esac

case "$rel" in
  *.ts | *.tsx | *.js | *.jsx | *.css | *.md | *.json | *.yml | *.yaml)
    if [[ -x "$PRETTIER" ]]; then
      run_quietly "$PRETTIER" --write "$file_path"
    fi
  ;;
esac

exit 0
