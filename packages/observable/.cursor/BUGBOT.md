# @rxjs/observable — Bugbot Rules

Applies when reviewing changes under `packages/observable/`. Authoring reference: [.cursor/rules/rxjs-observable-core.mdc](../../../.cursor/rules/rxjs-observable-core.mdc).

## Scope

If the PR adds pipeable operators, marble-test-only utilities, or schedulers under `packages/observable/`, then add a blocking bug titled **"Out-of-scope code in @rxjs/observable"** with body: "This package is core primitives only: `Observable`, `Subscriber`, `Subscription`, `operate()`. Operators and schedulers belong in `packages/rxjs`."

If the PR imports from `rxjs` or `rxjs/operators` inside `packages/observable/`, then add a blocking bug titled **"Invalid dependency direction"** with body: "`packages/rxjs` depends on `@rxjs/observable`, not the reverse."

## Tests

If the PR modifies `packages/observable/src/**/*.ts` (excluding `*.spec.ts`) and does not modify a corresponding `*.spec.ts` in the same area, then add a blocking bug titled **"Missing Vitest coverage"** with body: "Changes to `@rxjs/observable` require Vitest specs (`packages/observable/src/*.spec.ts`). Run `yarn nx test @rxjs/observable`."

If new tests use Mocha/Jasmine patterns instead of Vitest (`describe`/`it`/`expect` from `vitest`), then add a non-blocking bug titled **"Use Vitest in @rxjs/observable"** with body: "This package uses Vitest, not Mocha marble tests."

## Build

If the PR changes the build to use `tsc -b` like `packages/rxjs` instead of the package's `tshy` dual CJS/ESM setup, then add a blocking bug titled **"Wrong build tool for @rxjs/observable"** with body: "`@rxjs/observable` builds with `tshy`. Do not replace with `tsc -b` without an explicit migration."
