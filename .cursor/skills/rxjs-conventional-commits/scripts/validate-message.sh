#!/usr/bin/env bash
# Validate a commit message against RxJS conventional-commit rules.
# Usage: validate-message.sh "message"   OR   validate-message.sh < message.txt
# Exit 0 when valid; exit 1 and print errors to stderr when invalid.

set -euo pipefail

message="${1:-}"
if [[ -z "$message" ]]; then
  message="$(cat)"
fi

if [[ -z "${message//[[:space:]]/}" ]]; then
  echo "error: empty commit message" >&2
  exit 1
fi

errors=()
types='feat|fix|docs|style|refactor|perf|test|chore'
header_pattern="^(revert: )?(${types})(\\([^)]+\\))?: .+"

while IFS= read -r line || [[ -n "$line" ]]; do
  if ((${#line} > 100)); then
    errors+=("line exceeds 100 characters: ${line:0:60}…")
  fi
done <<<"$message"

header="$(printf '%s\n' "$message" | sed '/./,$!d' | head -n1)"

if [[ ! "$header" =~ $header_pattern ]]; then
  errors+=("header must match: <type>(<scope>): <subject>  (types: ${types//|/, })")
  errors+=("  got: $header")
else
  subject="${header#*: }"
  if [[ "$subject" =~ ^[A-Z] ]]; then
    errors+=("subject must not start with a capital letter")
  fi
  if [[ "$subject" =~ \.$ ]]; then
    errors+=("subject must not end with a period")
  fi
  if [[ -z "${subject//[[:space:]]/}" ]]; then
    errors+=("subject must not be empty")
  fi
fi

if ((${#errors[@]} > 0)); then
  printf '%s\n' "${errors[@]}" >&2
  exit 1
fi

exit 0
