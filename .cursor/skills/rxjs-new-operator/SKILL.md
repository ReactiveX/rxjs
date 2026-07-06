---
name: rxjs-new-operator
description: >-
  Scaffold a new RxJS operator with implementation, marble tests, dtslint stub,
  and export checklist. Use when the user wants to add a new operator, creation
  function, or make their first code contribution to packages/rxjs.
---

# RxJS New Operator

Model-invoked workflow for a **first correct contribution** — operator file, tests, types, exports, and docs checklist. Conventions live in `.cursor/rules/`; this skill is the ordered path.

## Before you write code

1. **Confirm intent** — operator name (camelCase), behavior in one sentence, and whether it is **public** (exported from `src/index.ts`) or internal-only.
2. **Read a sibling** — open the nearest existing operator and its spec (e.g. `map.ts` + `map-spec.ts`). Match patterns; do not invent structure.
3. **Run scaffold** (optional but recommended) from repo root:

   ```sh
   .cursor/skills/rxjs-new-operator/scripts/scaffold.sh <operatorName>
   ```

   Creates implementation, marble spec skeleton, and dtslint stub. Does **not** edit barrel exports — you must wire those manually.

## Implementation checklist

1. **Operator file** — `packages/rxjs/src/internal/operators/<name>.ts`

   - Pipeable operator returning `(source) => new Observable(...)` using `operate()` from `@rxjs/observable`
   - ESM imports with `.js` extensions
   - See `rxjs-operators` rule for JSDoc when shipping public API

2. **Marble tests** — `packages/rxjs/spec/operators/<name>-spec.ts`

   - `/** @test {<name>} */` on describe
   - `TestScheduler.run()` with `expectSubscriptions` where meaningful
   - Canonical cases: never, empty, single, multiple, error, never-ending, early disposal
   - Callback operators: success, context (if supported), thrown error
   - See `rxjs-marble-tests` rule

3. **Type tests** — `packages/rxjs/spec-dtslint/operators/<name>-spec.ts` when signatures are non-trivial

   - `$ExpectType`, `$ExpectError`, `$ExpectDeprecation` as inline end-of-line comments

4. **Exports** (public operators only)

   - `packages/rxjs/src/operators/index.ts`
   - `packages/rxjs/src/index.ts`

5. **Verify**

   ```sh
   yarn workspace rxjs test -- --grep '<name>'
   yarn workspace rxjs dtslint
   ```

6. **Public API docs checklist** (public operators only — see `rxjs-operators` rule)
   - JSDoc with informal span, marble PNG, `@example`
   - Listed in `apps/rxjs.dev/content/guide/operators.md` when shipping new API

## Creation functions (non-operators)

If the user wants a **creation function** instead of an operator:

- Read `rxjs-core-internals` rule and a sibling under `internal/observable/`
- Spec goes under `spec/observables/`, not `spec/operators/`
- Do not use `operate()` — return `Observable` directly

## Do not

- Put operators in `packages/observable`
- Skip marble tests for operator changes
- Edit generated API docs under `apps/rxjs.dev/` — update JSDoc in source instead
- Commit without conventional commit message (see `rxjs-conventional-commits` skill)

## Reference

- [operators.md § Creating custom operators](../../apps/rxjs.dev/content/guide/operators.md#creating-custom-operators)
- [marble-testing.md](../../apps/rxjs.dev/content/guide/testing/marble-testing.md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
