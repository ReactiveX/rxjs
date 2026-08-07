---
name: migrate-rxjs-7-to-9
description: Migrate an RxJS 7 application, library, or test suite to RxJS 9 through an evidence-first behavioral workflow with explicit platform-versus-producer-per-subscription lifecycle decisions, characterization tests, bounded read-only MCP analysis and preview, exact Symbol authoring, AbortSignal ownership, safe stops, and post-migration verification. Use only for RxJS 7-to-9 migration or migration planning.
---

# Migrate RxJS 7 to RxJS 9

Treat this as a behavioral migration, not an import rewrite. Pin the source
guidance to RxJS `7.8.2` and target `9.0.0-beta.1`.

```ts
// RxJS 7 shape
const result = source.pipe(debounceTime(200), switchMap(load));

// Candidate RxJS 9 syntax; lifecycle and cancellation still require review.
const result = source[debounce](200)[switchMap](load);
```

Use this sequence:

1. Record exact versions, framework constraints, build/test commands, and a
   green RxJS 7 baseline.
2. Inventory pipelines, terminal subscriptions, Subjects, sharing, custom
   sources/operators, scheduler usage, tests, inputs, and public RxJS types.
3. Add characterization tests where repeated subscriptions, cancellation,
   teardown, timing, replay, errors, or completion are not already protected.
4. Choose `platform-shared`, `producer-per-direct-subscription`, `subject-hot`,
   `not-applicable`, `unsupported`, or `unresolved` for every migration unit.
5. Validate the migration-contract schema separately from readiness. A valid
   but unresolved contract is not permission to transform.
6. Call `migration_capabilities`, then `analyze_migration` with explicit source
   text and repository-relative names. Resolve refusals before preview.
7. Call `preview_migration` only in reviewed batches. The MCP has no filesystem
   authority; inspect candidate source, imports, and every diagnostic before
   applying with the host agent's ordinary editing tools.
8. Finish semantic work manually: lifecycle, cancellation, inputs, Subjects,
   schedulers, custom code, frameworks, and tests.
9. Re-run type/build/lint and baseline-equivalent behavior tests. Re-preview
   accepted candidate source to confirm idempotence. Record every intentional
   divergence and unresolved stop.

Never infer an unsupported mapping, delete a scheduler argument without timing
evidence, or choose shared/cold lifecycle silently. A refusal is a successful
safe stop, not an invitation to bypass the engine.

## Load references by migration phase

- Start with [migration contract](references/migration-contract.md) for
  evidence, classifications, readiness, and MCP authority.
- Use [inventory and batching](references/inventory-and-batching.md) to scope
  units, baseline evidence, and atomic MCP requests.
- Use [lifecycle decisions](references/lifecycle-decisions.md) before changing
  any source that can be observed more than once.
- Use [target authoring rules](references/target-authoring-rules.md) to ensure
  accepted output meets RxJS 9 quality rules rather than merely compiling.
- Use [operators and composition](references/operators-and-composition.md) for
  exact Symbols, unified capabilities, overloads, and manual pipelines.
- Use [cancellation and teardown](references/cancellation-and-teardown.md) for
  Subscription removal, owner signals, resources, and terminal order.
- Use [sources, inputs, Subjects, and sharing](references/sources-inputs-subjects-and-sharing.md)
  for creation, ObservableValue limits, replay, state, and multicasting.
- Use [schedulers and testing](references/schedulers-and-testing.md) for host
  timing, `@rxjs/test`, and source-model selection.
- Use [custom sources and operators](references/custom-sources-and-operators.md)
  before migrating `new Observable`, subclasses, lift, or domain operators.
- Use [migration examples](references/migration-examples.md) for reviewed
  before/candidate pairs.
- Use [verification and safe stops](references/verification-and-safe-stops.md)
  for completion criteria and blocker handling.
- Consult the [generated migration capabilities](references/migration-capabilities.md)
  for the exact mechanically proved registry. Do not copy that mutable list
  into prose.

Hand target-code questions to `write-rxjs-9`, reviews to `review-rxjs-9`, and
test implementation to `write-rxjs-9-tests`.
