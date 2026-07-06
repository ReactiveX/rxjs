#!/usr/bin/env bash
# Inject conventional-commit guidance before agent git commits.
# Validates extracted messages; blocks invalid commits via permission: deny.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VALIDATOR="$ROOT/.cursor/skills/rxjs-conventional-commits/scripts/validate-message.sh"
SKILL=".cursor/skills/rxjs-conventional-commits/SKILL.md"

input="$(cat)"
command="$(echo "$input" | jq -r '.command // empty')"

# Only git commit (including --amend); ignore other git subcommands.
if [[ ! "$command" =~ (^|[[:space:]])git[[:space:]]+commit([[:space:]]|$) ]]; then
  echo '{ "permission": "allow" }'
  exit 0
fi

extract_heredoc_message() {
  local cmd="$1"

  # Single-line HEREDOC: git commit -m "$(cat <<'EOF' body EOF )"
  if [[ "$cmd" == *"<<"*"EOF"* ]]; then
    local inline
    inline="$(printf '%s' "$cmd" | awk '
      match($0, /<<[[:space:]]*('\''EOF'\''|"EOF"|EOF)[[:space:]]*/) {
        start = RSTART + RLENGTH
        rest = substr($0, start)
        if (match(rest, /EOF/)) {
          body = substr(rest, 1, RSTART - 1)
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", body)
          gsub(/\)[[:space:]]*$/, "", body)
          if (length(body) > 0) {
            print body
          }
        }
      }
    ')"
    if [[ -n "$inline" ]]; then
      printf '%s' "$inline"
      return 0
    fi
  fi

  # Multi-line HEREDOC (command string contains literal newlines)
  if [[ "$cmd" == *$'\n'* && "$cmd" == *"<<"*"EOF"* ]]; then
    local multiline
    multiline="$(printf '%s\n' "$cmd" | awk '
      BEGIN { in_body = 0 }
      /cat[[:space:]]+<<[[:space:]]*/ {
        in_body = 1
        next
      }
      in_body && (/^EOF[[:space:]]*\)/ || /^EOF[[:space:]]*$/) {
        exit
      }
      in_body {
        print
      }
    ')"
    if [[ -n "$multiline" ]]; then
      printf '%s' "$multiline"
      return 0
    fi
  fi

  return 1
}

extract_message() {
  local cmd="$1"
  local msg=""

  if msg="$(extract_heredoc_message "$cmd")"; then
    printf '%s' "$msg"
    return 0
  fi

  # Repeated -m "..." / -m '...' (git joins with newlines)
  while [[ "$cmd" =~ -m[[:space:]]+ ]]; do
    local fragment=""
    if [[ "$cmd" =~ -m[[:space:]]+\"(([^\"\\]|\\.)*)\" ]]; then
      fragment="${BASH_REMATCH[1]}"
      cmd="${cmd/-m \"${BASH_REMATCH[1]}\"/}"
    elif [[ "$cmd" =~ -m[[:space:]]+\'([^\']*)\' ]]; then
      fragment="${BASH_REMATCH[1]}"
      cmd="${cmd/-m \'${BASH_REMATCH[1]}\'/}"
    else
      break
    fi
    if [[ -n "$msg" ]]; then
      msg+=$'\n'
    fi
    msg+="$fragment"
  done

  if [[ -n "$msg" ]]; then
    printf '%s' "$msg"
  fi
}

deny_invalid_message() {
  local validation="$1"
  jq -n \
    --arg skill "$SKILL" \
    --arg validation "$validation" \
    '{
      permission: "deny",
      user_message: "Commit message does not follow RxJS conventional-commit format.",
      agent_message: ("Rewrite the commit message per " + $skill + " before committing.\n\nValidation errors:\n" + $validation)
    }'
}

message="$(extract_message "$command" || true)"

if [[ -n "$message" && -x "$VALIDATOR" ]]; then
  validation_err="$(mktemp)"
  if ! "$VALIDATOR" "$message" 2>"$validation_err"; then
    validation="$(cat "$validation_err")"
    rm -f "$validation_err"
    deny_invalid_message "$validation"
    exit 0
  fi
  rm -f "$validation_err"
fi

jq -n \
  --arg skill "$SKILL" \
  '{
    permission: "allow",
    agent_message: ("Follow RxJS conventional commits (" + $skill + "): type(scope): subject, imperative lowercase subject, max 100 chars/line. Run git diff first; use a HEREDOC for multi-line messages.")
  }'
