#!/usr/bin/env bash
# Scaffold operator implementation, marble spec, and dtslint stub.
# Usage: scaffold.sh <operatorName>   (camelCase, e.g. mapValues)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
TEMPLATES="$(cd "$(dirname "$0")/../templates" && pwd)"

name="${1:-}"
if [[ -z "$name" ]]; then
  echo "Usage: $(basename "$0") <operatorName>" >&2
  exit 1
fi

if [[ ! "$name" =~ ^[a-z][a-zA-Z0-9]*$ ]]; then
  echo "error: operator name must be camelCase starting with lowercase (got: $name)" >&2
  exit 1
fi

operator_ts="$ROOT/packages/rxjs/src/internal/operators/${name}.ts"
operator_spec="$ROOT/packages/rxjs/spec/operators/${name}-spec.ts"
dtslint_spec="$ROOT/packages/rxjs/spec-dtslint/operators/${name}-spec.ts"

for target in "$operator_ts" "$operator_spec" "$dtslint_spec"; do
  if [[ -e "$target" ]]; then
    echo "error: already exists: ${target#"$ROOT"/}" >&2
    exit 1
  fi
done

render() {
  local template="$1"
  local dest="$2"
  sed "s/__OPERATOR__/${name}/g" "$template" >"$dest"
  printf '  created %s\n' "${dest#"$ROOT"/}"
}

render "$TEMPLATES/operator.ts.tpl" "$operator_ts"
render "$TEMPLATES/operator-spec.ts.tpl" "$operator_spec"
render "$TEMPLATES/dtslint-spec.ts.tpl" "$dtslint_spec"

printf '\nNext steps:\n'
printf '  1. Read a sibling operator and adapt the scaffolded files\n'
printf '  2. Export from packages/rxjs/src/operators/index.ts and src/index.ts (if public)\n'
printf '  3. yarn workspace rxjs test -- --grep %s\n' "$name"
printf '  4. yarn workspace rxjs dtslint\n'
