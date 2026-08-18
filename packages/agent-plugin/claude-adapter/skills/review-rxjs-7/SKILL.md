---
name: review-rxjs-7
description: Review RxJS 7.8.x code for subscription ownership, higher-order concurrency, recovery scope, completion dependencies, deterministic teardown, synchronous side effects, reentrancy and feedback machines, Subjects, sharing and retention, Promise conversion, custom sources and operators, performance, readability, and lifecycle tests. Use only for RxJS 7 code or maintenance; do not apply RxJS 9 platform-sharing, exact-Symbol, or AbortSignal contracts.
---

# Review RxJS 7

Pin runtime claims to RxJS `7.8.2`. Trace each terminal subscription upstream,
then recursively inspect higher-order, notifier, combination, retry, repeat,
and recovery children. Review lifetime and terminal behavior before style.

Use this order:

1. Identify the owner of every terminal subscription and manual resource.
2. State replace, queue, overlap, or ignore behavior for every higher-order
   boundary; verify cancellation and buffering match the requirement.
3. Trace `error`, `complete`, and explicit unsubscription separately.
4. Inspect Subjects, sharing, replay, retained closures, reset policy,
   synchronous side effects, and intentional or indirect feedback edges.
5. Review custom sources/operators for forwarding, user callback errors,
   synchronous reentrancy, child ownership, and teardown.
6. Require tests for the lifecycle behavior that supports each finding.
7. Report confirmed behavior bugs first, then evidence-backed risks, design
   tradeoffs, and readability improvements.

Lead each finding with file and line, the concrete scenario, observable impact,
and smallest safe correction. Do not report an operator name as the problem;
report the requirement it violates.

## Load references by review area

- Use [review workflow](references/review-workflow.md) for evidence,
  classification, severity, and finding format.
- Use [subscription ownership and teardown](references/subscription-ownership-and-teardown.md)
  for subscription trees, resource lifetime, completion traps, and reentrancy.
- Use [concurrency, errors, and completion](references/concurrency-errors-and-completion.md)
  for flattening, recovery scope, retry, joins, and Promise conversion.
- Use [sharing, Subjects, and retention](references/sharing-subjects-and-retention.md)
  for reset policy, replay memory, state, and write authority.
- Use [custom sources and operators](references/custom-sources-and-operators.md)
  for public operator construction and protocol correctness.
- Use [review examples](references/review-examples.md) for good/bad code and
  actionable finding examples.
- Use [testing evidence](references/testing-evidence.md) to decide which tests
  prove or fail to prove the behavior.

Hand accepted rewrites to `write-rxjs-7` and missing tests to
`write-rxjs-7-tests`.
