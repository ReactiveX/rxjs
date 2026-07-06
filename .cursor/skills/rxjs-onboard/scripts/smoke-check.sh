#!/usr/bin/env bash
# RxJS onboarding preflight. Attempts toolchain fixes by default; exits 1 if checks still fail.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

FIX=1
if [[ "${1:-}" == "--check-only" ]]; then
  FIX=0
fi

REPO_YARN="$ROOT/.yarn/releases/yarn-1.22.21.cjs"
yarn_cmd() {
  if [[ -f "$REPO_YARN" ]]; then
    node "$REPO_YARN" "$@"
  elif command -v yarn >/dev/null 2>&1; then
    yarn "$@"
  else
    return 127
  fi
}

failures=0
pass() { printf '  ✓ %s\n' "$1"; }
fail() { printf '  ✗ %s\n' "$1"; failures=$((failures + 1)); }
info() { printf '  → %s\n' "$1"; }

node_version_ok() {
  command -v node >/dev/null 2>&1 || return 1
  node -e "
const [maj, min] = process.version.slice(1).split('.').map(Number);
const ok = (maj === 18 && min >= 13) || (maj === 20 && min >= 9) || maj > 20;
process.exit(ok ? 0 : 1);
" 2>/dev/null
}

try_install_node() {
  info "attempting Node 20 install/switch (need ^18.13.0 || ^20.9.0)..."

  if command -v fnm >/dev/null 2>&1; then
    eval "$(fnm env --shell bash 2>/dev/null || fnm env 2>/dev/null)" 2>/dev/null || true
    if fnm install 20 && fnm use 20; then
      return 0
    fi
  fi

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
    if nvm install 20 && nvm use 20; then
      return 0
    fi
  fi

  if command -v volta >/dev/null 2>&1; then
    if volta install node@20; then
      return 0
    fi
  fi

  if [[ "$(uname -s)" == Darwin ]] && command -v brew >/dev/null 2>&1; then
    if brew list node@20 >/dev/null 2>&1 || brew install node@20; then
      for prefix in /opt/homebrew/opt/node@20 /usr/local/opt/node@20; do
        if [[ -d "$prefix/bin" ]]; then
          export PATH="$prefix/bin:$PATH"
          return 0
        fi
      done
    fi
  fi

  return 1
}

try_install_yarn() {
  if [[ -f "$REPO_YARN" ]]; then
    return 0
  fi

  info "repo Yarn missing — trying corepack..."
  if command -v corepack >/dev/null 2>&1; then
    corepack enable 2>/dev/null || true
    corepack prepare yarn@1.22.21 --activate 2>/dev/null || true
  fi

  [[ -f "$REPO_YARN" ]]
}

ensure_node() {
  if node_version_ok; then
    return 0
  fi
  if [[ "$FIX" -eq 0 ]]; then
    return 1
  fi
  try_install_node
}

ensure_yarn() {
  if [[ -f "$REPO_YARN" ]]; then
    return 0
  fi
  if [[ "$FIX" -eq 0 ]]; then
    return 1
  fi
  try_install_yarn
}

printf 'RxJS onboard preflight (%s)\n' "$ROOT"
if [[ "$FIX" -eq 1 ]]; then
  printf 'Mode: fix toolchain issues when possible (--check-only to skip)\n'
fi
printf '\n'

# --- toolchain ---
printf 'Toolchain\n'

ensure_node || true
if node_version_ok; then
  pass "Node $(node -v) (requires ^18.13.0 || ^20.9.0)"
else
  if command -v node >/dev/null 2>&1; then
    fail "Node $(node -v) — need ^18.13.0 || ^20.9.0 (install fnm/nvm, or: brew install node@20)"
  else
    fail "Node not found — install fnm/nvm/volta, or: brew install node@20"
  fi
fi

ensure_yarn || true
if [[ -f "$REPO_YARN" ]]; then
  yarn_ver="$(node "$REPO_YARN" --version 2>/dev/null || true)"
  if [[ "$yarn_ver" == 1.22.21 ]]; then
    pass "Yarn $yarn_ver (repo-bundled at .yarn/releases/)"
  else
    fail "Repo Yarn reports $yarn_ver — expected 1.22.21"
  fi
elif command -v yarn >/dev/null 2>&1; then
  yarn_ver="$(yarn --version 2>/dev/null || true)"
  if [[ "$yarn_ver" == 1.22.21 ]]; then
    pass "Yarn $yarn_ver (global fallback)"
  else
    fail "Yarn $yarn_ver — need 1.22.21; missing .yarn/releases/yarn-1.22.21.cjs"
  fi
else
  fail "Yarn not available — repo bundle missing and no global yarn"
fi

# --- install ---
printf '\nDependencies\n'

if [[ ! -d node_modules ]] || [[ ! -f node_modules/.yarn-integrity ]]; then
  info "running yarn install..."
  if yarn_cmd install; then
    pass "yarn install"
  else
    fail "yarn install failed"
  fi
else
  pass "node_modules present (run yarn install manually if packages look stale)"
fi

# --- nx graph ---
printf '\nNx workspace\n'

if [[ -x node_modules/.bin/nx ]]; then
  projects="$(node_modules/.bin/nx show projects 2>/dev/null | tr '\n' ' ')"
  if [[ -n "$projects" ]]; then
    pass "Nx projects: $projects"
  else
    fail "nx show projects returned no projects"
  fi
else
  fail "nx not found in node_modules — yarn install may have failed"
fi

# --- smoke ---
printf '\nSmoke tests\n'

if node_modules/.bin/nx test @rxjs/observable >/dev/null 2>&1; then
  pass "@rxjs/observable tests"
else
  fail "@rxjs/observable tests (yarn nx test @rxjs/observable)"
fi

if node_modules/.bin/nx build @rxjs/observable >/dev/null 2>&1; then
  pass "@rxjs/observable build"
else
  fail "@rxjs/observable build (yarn nx build @rxjs/observable)"
fi

printf '\n'
if [[ "$failures" -eq 0 ]]; then
  printf 'All checks passed.\n'
  exit 0
fi

printf '%d check(s) failed.\n' "$failures"
exit 1
