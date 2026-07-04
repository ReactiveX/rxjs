#!/usr/bin/env bash
# Deploy rxjs.dev dist/ to Firebase Hosting using firebase.preview.json.
# Auth and active project should already be set via Firebase MCP (firebase_login,
# firebase_update_environment). CLI credentials are shared with the MCP server.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
DOCS="$ROOT/apps/rxjs.dev"

cd "$DOCS"

if [[ ! -d dist ]]; then
  echo "dist/ not found — run .cursor/skills/rxjs-firebase-docs/scripts/build.sh first."
  exit 1
fi

resolve_project() {
  if [[ -n "${FIREBASE_PROJECT:-}" ]]; then
    echo "$FIREBASE_PROJECT"
    return
  fi
  if [[ -f .firebaserc.local ]]; then
    node -e "
const fs = require('fs');
const rc = JSON.parse(fs.readFileSync('.firebaserc.local', 'utf8'));
const id = rc.projects?.default || rc.projects?.preview;
if (id) process.stdout.write(id);
"
    return
  fi
}

PROJECT="$(resolve_project || true)"
if [[ -z "$PROJECT" ]]; then
  echo "No Firebase project configured."
  echo "Set active_project via Firebase MCP firebase_update_environment, or write apps/rxjs.dev/.firebaserc.local"
  exit 1
fi

printf 'Deploying to Firebase project: %s\n' "$PROJECT"

deploy_args=(deploy --only hosting --config firebase.preview.json --project "$PROJECT")
if [[ -n "${FIREBASE_TOKEN:-}" ]]; then
  deploy_args+=(--token "$FIREBASE_TOKEN")
fi

yarn firebase -- "${deploy_args[@]}"

printf '\nDeployed:\n  https://%s.web.app\n  https://%s.firebaseapp.com\n' "$PROJECT" "$PROJECT"
