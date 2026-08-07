# Verification and safe stops

## Candidate review

For every previewed file:

- compare source and candidate behavior, not formatting alone;
- inspect every added/removed import, platform-method choice, and exact Symbol identity;
- resolve every diagnostic and review note;
- confirm no unsupported mixed pipeline was partially changed;
- apply the chosen lifecycle and cancellation architecture;
- review generated unified options as explicit policy; and
- run the RxJS 9 authoring and review skills over the final form.

## Deterministic verification

Run the narrow affected tests first, then:

- target TypeScript build and declaration generation;
- lint and formatting;
- baseline-equivalent unit/integration/browser/framework tests;
- repeated/concurrent subscription lifecycle tests;
- cancellation and resource teardown tests;
- timing and source-model tests;
- public import/package tests; and
- a second MCP preview proving accepted output is unchanged/idempotent.

Do not run paid model evaluations or authenticated credit-consuming client
commands. Schema, fixture, type, package, protocol, and local discovery checks
are sufficient release gates.

## Safe-stop conditions

Stop and record the affected unit when:

- target lifecycle is unresolved;
- characterization tests are missing for a material semantic change;
- an input depends on unsupported subscribable/interop behavior;
- a scheduler/timing contract has no accepted host replacement;
- a custom operator depends on removed internals;
- an overload or pipeline is absent from the proved registry and target
  behavior has not been reviewed;
- a framework peer contract rejects RxJS 9;
- preview is refused, malformed, stale, or exceeds limits; or
- type/test failures cannot be distinguished from intentional divergence.

Do not bypass a refusal by editing only the lines that look obvious. Preserve
the old unit, add evidence, and request the missing design decision.

## Completion criteria

A migration is complete only when:

- all units have accepted target lifecycle or documented exclusion;
- no unresolved/unsupported code is presented as migrated;
- platform methods are preferred where correct, and exact imports/public APIs
  are used where required;
- cancellation, resources, inputs, Subjects, timing, and custom code are
  reviewed;
- target tests prove the selected lifecycle and behavior;
- intentional divergences are documented for callers; and
- final source is reviewed as excellent RxJS 9 code, not merely transformed
  RxJS 7 syntax.
