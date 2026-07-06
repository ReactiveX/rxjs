---
name: rxjs-github-issue
description: >-
  Triage a ReactiveX/rxjs GitHub issue: fetch details, map API to source files,
  check reporter conclusions, and route to repro-to-test or bug-fix skills. Use
  when the user shares an issue URL or number like "fix #7602".
---

# RxJS GitHub Issue

Lightweight intake before writing tests or code.

## Workflow

1. **Fetch the issue**

   ```sh
   gh issue view <number> --repo ReactiveX/rxjs --json title,body,labels,comments
   ```

2. **Map API → files**

   | Report mentions              | Start here                                        | Spec                              |
   | ---------------------------- | ------------------------------------------------- | --------------------------------- |
   | Operator (`delay`, `map`, …) | `packages/rxjs/src/internal/operators/<name>.ts`  | `spec/operators/<name>-spec.ts`   |
   | `timer`, `interval`, `of`, … | `packages/rxjs/src/internal/observable/<name>.ts` | `spec/observables/<name>-spec.ts` |
   | Scheduler / timing           | `packages/rxjs/src/internal/scheduler/`           | `spec/schedulers/`                |
   | Subscriber / Subscription    | `packages/rxjs/src/` or `@rxjs/observable`        | `spec/Subscriber-spec.ts`, etc.   |

3. **Read issue comments** — reporters often self-diagnose (e.g. `setTimeout` max delay). Do not re-investigate from scratch if the comment is credible.

4. **Classify**

   - **Timing / scheduler** → `rxjs-repro-to-test` + `asyncScheduler` in marbles; see scheduler triage there
   - **Wrong emissions / ordering** → marble test with default `TestScheduler`
   - **Types** → `spec-dtslint/`
   - **Docs only** → `apps/rxjs.dev/content/` or JSDoc in source

5. **Route**

   - Test first → `rxjs-repro-to-test`
   - Full fix → `rxjs-bug-fix`
   - Commit / PR → `rxjs-conventional-commits` + CONTRIBUTING.md

## Plain-language handoff

After triage, state:

- Suspected root cause (one sentence)
- Files to change
- Whether a failing marble test already exists or needs writing
- Suggested `yarn workspace rxjs test -- --grep '…'` fragment

## Do not

- Push or open PRs unless asked
- Mix unrelated enablement/docs changes into a bug-fix commit
