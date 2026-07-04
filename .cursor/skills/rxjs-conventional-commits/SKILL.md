---
name: rxjs-conventional-commits
description: >-
  Format git commit messages for the RxJS monorepo using conventional commits
  from CONTRIBUTING.md. Use when writing commit messages, running git commit,
  staging changes for commit, or when the user asks to commit.
---

# RxJS Conventional Commits

RxJS generates **release changelogs from commit messages**. Every commit must follow the format in [CONTRIBUTING.md](../../../CONTRIBUTING.md#commit-message-format).

## Before committing

1. Run `git status` and `git diff` (staged + unstaged) to understand the change.
2. Pick **one logical change** per commit; split unrelated edits.
3. Draft the message using the rules below.
4. Validate (optional but recommended):

   ```sh
   .cursor/skills/rxjs-conventional-commits/scripts/validate-message.sh <<'EOF'
   type(scope): subject

   body paragraph
   EOF
   ```

5. Commit with a HEREDOC so formatting is preserved:

   ```sh
   git commit -m "$(cat <<'EOF'
   type(scope): subject

   Optional body explaining why, not what.
   EOF
   )"
   ```

## Format

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

- **Header** is mandatory; **scope** is optional.
- **No line** may exceed **100 characters**.

### Type (required)

One of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

| Type       | Use for                                     |
| ---------- | ------------------------------------------- |
| `feat`     | New feature                                 |
| `fix`      | Bug fix                                     |
| `docs`     | Documentation only                          |
| `style`    | Formatting, whitespace — no behavior change |
| `refactor` | Code change — neither fix nor feature       |
| `perf`     | Performance improvement                     |
| `test`     | Adding or updating tests                    |
| `chore`    | Build, tooling, CI, deps                    |

### Scope (optional)

Where the change lives — e.g. `operators`, `Observable`, `switchMap`, `rxjs.dev`.

### Subject (required)

- Imperative, present tense: `add` not `added` / `adds`
- Lowercase first letter
- No trailing period

### Body (optional)

Imperative present tense. Explain **why** and contrast with previous behavior.

### Footer (optional)

- `BREAKING CHANGE: <description>` for breaking changes (space or blank line before it)
- `Closes #123` / `Fixes #123` for linked issues

### Revert

```
revert: <type>(<scope>): <subject>

This reverts commit <full-sha>.
```

## Examples

```
fix(operators): handle empty source in switchMap

Return EMPTY when the inner observable completes without emitting.
```

```
docs(rxjs.dev): fix decision tree file url in README
```

```
chore: update nx to 17.3 stable
```

```
feat(observable): add tap operator side-effect hook

BREAKING CHANGE: tap observer signatures now match Observer<T> exactly.
```

## Common mistakes

- Past tense subject (`fixed bug` → `fix bug`)
- Capitalized subject (`Fix:` → `fix:`)
- Trailing dot on subject
- Mixing unrelated changes in one commit
- Lines longer than 100 characters
