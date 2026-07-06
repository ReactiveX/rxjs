# packages/rxjs — Bugbot Rules

Applies when reviewing changes under `packages/rxjs/`. Authoring reference: [.cursor/rules/rxjs-operators.mdc](../../../.cursor/rules/rxjs-operators.mdc), [rxjs-core-internals.mdc](../../../.cursor/rules/rxjs-core-internals.mdc), [rxjs-marble-tests.mdc](../../../.cursor/rules/rxjs-marble-tests.mdc), [rxjs-dtslint.mdc](../../../.cursor/rules/rxjs-dtslint.mdc).

## Operators

If the PR adds or modifies a file under `src/internal/operators/` or `src/operators/` and does not modify a corresponding file under `spec/operators/` (e.g. `<name>-spec.ts`), then add a blocking bug titled **"Missing operator marble tests"** with body: "Operator changes require marble tests in `spec/operators/`. Cover canonical cases: never, empty, single, multiple, error, never-ending, early disposal; callback operators also need success, context, and thrown-error cases when applicable."

If the PR adds a new public operator under `src/internal/operators/` and does not update both `src/operators/index.ts` and `src/index.ts`, then add a blocking bug titled **"Missing operator export"** with body: "Export new public operators from `src/operators/index.ts` and `src/index.ts`."

If the PR changes an operator's public TypeScript signature, overloads, type guards, or deprecation behavior and does not modify `spec-dtslint/` (or inline `// $ExpectType` / `// $ExpectError` / `// $ExpectDeprecation` in the marble spec), then add a blocking bug titled **"Missing dtslint coverage"** with body: "Type surface changes need dtslint tests in `spec-dtslint/` mirroring the operator name. Run `yarn workspace rxjs dtslint`."

If the PR adds a new **public** operator and is missing any of: JSDoc with informal summary and `@example`, marble PNG (`![](<name>.png)`), or listing in `apps/rxjs.dev/content/guide/operators.md`, then add a blocking bug titled **"Incomplete new public operator docs"** with body: "Public operators need JSDoc (informal span, marble PNG, `@see`/`@param`/`@return`, runnable `@example`), and must be listed in the operators guide when shipping new API."

If a higher-order operator or operator with inner subscriptions changes and the spec does not assert explicit unsubscription behavior (for example "should not break unsubscription chains when result is unsubscribed explicitly" or a synchronous source that checks `subscriber.closed` after downstream `take`), then add a blocking bug titled **"Missing unsubscription regression coverage"** with body: "Operators that subscribe to sources or inners need tests proving teardown happens on explicit unsubscribe and synchronous sources stop producing after the destination closes."

If new or changed marble tests create hot/cold observables with meaningful subscription logs but do not assert `expectSubscriptions(...)`, then add a blocking bug titled **"Missing subscription assertions in marble test"** with body: "Marble tests should assert source and inner subscriptions whenever the subscription log is meaningful, especially for early disposal, error, and higher-order cases."

If a newly added test only asserts inside an error/next callback, conditional branch, or async callback and would still pass if that callback never ran, then add a blocking bug titled **"Test can pass without exercising assertion"** with body: "Add an explicit call-count, sentinel variable, rejection path, or subscription/order assertion so the test fails when the expected callback is not invoked."

## Core internals (non-operators)

If the PR modifies `src/internal/observable/`, subjects, schedulers, ajax, webSocket, or util code and does not modify a corresponding spec under `spec/observables/`, `spec/subjects/`, `spec/schedulers/`, `spec/ajax/`, or `spec/websocket/`, then add a blocking bug titled **"Missing core internals tests"** with body: "Match the nearest sibling spec pattern. Use marble tests when timing matters."

If the PR introduces operator logic (pipeable `OperatorFunction`, `operate()` wrappers for stream transforms) in non-operator paths such as `internal/observable/` or `internal/util/`, then add a blocking bug titled **"Operator logic in wrong layer"** with body: "Keep pipeable operators in `internal/operators/`. Creation functions return `Observable` directly."

If the PR changes public Observable, Subject, Subscription, scheduler, error-handling, or creation-function behavior and only updates tests, then add a blocking bug titled **"Behavior change missing user-facing docs"** with body: "User-visible semantic changes need JSDoc, guide, or deprecation/migration documentation as appropriate. Tests alone are not enough for behavior that users can observe."

If the PR exposes private implementation representations or test-only internals through public exports, docs, or public type signatures (for example scheduler message representations, Subscriber internals, Subject internals, or helper types from `internal/`), then add a blocking bug titled **"Do not expose private internals"** with body: "Private representations become support obligations once exported or documented. Keep internals private unless the PR includes an explicit public API rationale, docs, and type tests."

## Implementation correctness

If changed operator or scheduler code uses manual `setTimeout`/`setInterval` for testable timing instead of injected schedulers or `TestScheduler.run()`, then add a non-blocking bug titled **"Prefer schedulers over raw timers"** with body: "RxJS internals should use schedulers for deterministic tests."

If changed subscription teardown omits `unsubscribe`/`finalize` handling where the source observable can outlive the consumer, then add a blocking bug titled **"Possible subscription leak"** with body: "Ensure teardown runs on unsubscribe and that inner subscriptions are cleaned up."

If the PR introduces `any` in public signatures, overload implementations, error paths, callbacks, or helper types where `unknown` or a constrained generic would preserve type safety, then add a blocking bug titled **"Avoid unsafe any in public typing"** with body: "Prefer `unknown`, a constrained generic, or an existing helper type. Only keep `any` when it is required for overload compatibility and the surrounding file already uses that pattern."

If the PR adds an overload or generic type parameter that is not referenced in its parameters, return type, or constraints, then add a blocking bug titled **"Unused generic in public signature"** with body: "Remove unused generics or thread them through the signature so inference and dtslint expectations reflect the intended API."

If explanatory comments, TODOs, or JSDoc are changed near refactored code and still mention removed helpers or old names such as `lift`, `operate`, `project`, `wrapper`, `r(...)`, or pre-refactor control flow, then add a blocking bug titled **"Stale comment after refactor"** with body: "Update or remove comments that no longer describe the code. Reviewers repeatedly call out stale comments after operator and core rewrites."

If a JSDoc `@example` is added or changed and it omits required imports, source setup, or DOM setup needed for the snippet to run (for example `fromEvent(div, 'click')` without creating `div`), then add a blocking bug titled **"Non-runnable JSDoc example"** with body: "RxJS examples should be runnable in docs/StackBlitz: include imports and define every source, element, or helper used in the snippet."

## Imports and style

If new ESM imports under `packages/rxjs/src/` omit the `.js` extension (e.g. `from '../types'` instead of `from '../types.js'`), then add a blocking bug titled **"Missing .js extension in import"** with body: "ESM imports in `packages/rxjs` require `.js` extensions per repo convention."
