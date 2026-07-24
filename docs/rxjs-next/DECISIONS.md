# RxJS Next decision log

This file records durable project decisions without pretending that the
exploratory implementation has resolved every design detail. Use an ADR when a
decision needs a longer alternatives analysis; link it from this log.

Status meanings:

- **Accepted**: implementation should conform unless the decision is reopened.
- **Proposed**: current preferred direction; explicit approval is still needed.
- **Deferred**: goal acknowledged, design intentionally postponed.
- **Superseded**: retained for history but no longer controlling.

## D-001 — Base RxJS on the web-platform Observable

- **Status:** Accepted
- **Decision:** The active realm's web-platform `Observable` is the foundational
  type for the main RxJS library.
- **Rationale:** RxJS should extend the platform primitive rather than ship a
  competing Observable identity.
- **Consequence:** RxJS 7 subscription assumptions cannot be copied into the
  platform layer when they conflict with platform sharing or cancellation.

## D-002 — Use a polyfill only when the platform primitive is absent

- **Status:** Accepted
- **Decision:** RxJS will provide a fallback implementation, but a conforming
  native `Observable` takes precedence. String-named methods such as
  `Observable.prototype.map` remain part of the platform contract: they come
  from the native implementation when present and from the conforming fallback
  otherwise.
- **Rationale:** Native adoption is the point of the architecture, and replacing
  native behavior would undermine interoperability and conformance.
- **Consequence:** The current unconditional assignment to
  `globalThis.Observable` is prototype debt, not the target contract. RxJS must
  not replace a platform string-named method in order to add library behavior.
- **Unresolved detail:** The detection, installation, and import contract is
  still open.

## D-003 — Address RxJS extensions with Symbols

- **Status:** Accepted
- **Decision:** RxJS methods and factories are patched onto the active
  Observable constructor or prototype under exported Symbol keys. RxJS will
  export a Symbol for an operator even when the platform provides a
  string-named method with the same familiar name. Both forms intentionally
  coexist:

  ```ts
  observable.map(project); // Platform contract
  observable[map](project); // RxJS contract
  ```

  The Symbol-keyed RxJS implementation may delegate to the platform method
  when its contract is sufficient, or provide additional RxJS functionality
  under the separate key.

- **Rationale:** Symbols avoid adding RxJS string names to the platform API,
  give consumers one uniform invocation style across native-overlapping and
  RxJS-only operators, and leave room for richer RxJS contracts without
  replacing native behavior. They also prevent accidental trampling: only code
  holding the exact Symbol can address that property. Symbols with identical
  descriptions remain different keys. This corrects the shared string-key
  weakness of the RxJS 5 `rxjs/add/operator/*` patching model.
- **Consequence:** Symbol identity across bundles, versions, realms, and duplicate
  installs is part of the public API and must be decided before stabilization.
  A `Symbol.for` design would deliberately weaken collision isolation and
  requires explicit justification and namespacing. For every name shared with
  the platform, documentation and tests must state whether the RxJS form
  delegates, extends the accepted inputs or overloads, or otherwise differs.
  Sharing a familiar name does not imply identical contracts.

## D-004 — Keep backward compatibility in an additional library

- **Status:** Accepted
- **Decision:** RxJS 7 compatibility behavior will be supplied through a
  separate library or package boundary rather than by changing the platform
  Observable contract.
- **Rationale:** Some high-value RxJS 7 behavior is incompatible with the
  platform's shared, ref-counted producer lifecycle.
- **Consequence:** Package boundaries and type relationships must make the
  distinction visible to users and tools.

## D-005 — Preserve pipeable operators in compatibility work

- **Status:** Accepted
- **Decision:** The compatibility layer will support operator functions that can
  be composed in the RxJS 7 pipeable style.
- **Rationale:** Pipeable composition is central to the source structure of many
  existing RxJS applications and enables incremental migration.
- **Consequence:** The exact `pipe`, `OperatorFunction`, and return-type contract
  remains an open API design question.

## D-006 — Use RxJS 7 tests as behavioral evidence, not an unqualified gate

- **Status:** Accepted
- **Decision:** Former RxJS 7 tests will be retained or rewritten to validate
  new operators where practical. Each test must be classified when platform
  semantics make an unchanged result impossible or misleading.
- **Rationale:** The old suite contains valuable behavioral knowledge, but it
  also encodes the old subscription model and implementation structure.
- **Consequence:** A compatibility ledger and explicit accepted-divergence
  category are required.

## D-007 — Use RxJS 9 as the probable release name

- **Status:** Proposed
- **Decision:** Prefer RxJS 9 over reviving the cancelled RxJS 8 name.
- **Rationale:** Reusing RxJS 8 would blur the distinction between the cancelled
  effort and this platform-based architecture.
- **Consequence:** Current `8.0.0-alpha` package versions are not authoritative.
  Final versioning and pre-release naming remain release decisions.

## D-008 — Provide migration Skills and MCP capabilities

- **Status:** Deferred
- **Decision:** Plan to ship AI-oriented knowledge and tools that help users
  apply RxJS Next and migrate from RxJS 7.
- **Rationale:** The semantic migration is substantial and benefits from
  repository-grounded, executable assistance.
- **Consequence:** Do not design the packaging, permissions, server model, or
  release coupling until the runtime and compatibility APIs are stable enough
  to encode.

## D-009 — Separate the attested WPT harness gate from conformance work

- **Status:** Superseded
- **Superseded by:** D-011 for command and CI semantics. Its pinned import,
  attestation, and reviewed-baseline requirements remain incorporated into
  D-011.
- **Decision:** Test the fallback with the official browser WPT runner against
  WPT commit `6a009d73f0d315941b90cac13a9523a2a08c631b`. The blocking harness
  gate requires complete execution, exact RxJS implementation identity in
  every test realm, and an exact reviewed result baseline. It does not require
  all upstream behavior tests to pass. A separate strict gate represents later
  conformance work.
- **Rationale:** A native-capable browser is required for realistic window,
  worker, iframe, and Web IDL behavior, but its native Observable could make a
  fallback suite pass for the wrong reason. Exact constructor, `subscribe`,
  `EventTarget.prototype.when`, and bundle-hash attestation prevents that false
  signal while allowing test infrastructure to land before behavior fixes.
- **Consequence:** The harness may mask native slots only inside disposable test
  realms and must not add a force-install API or otherwise alter production
  behavior. Every generated WPT URL has one independently audited attestation
  subtest that expectation metadata cannot suppress. Known behavior failures
  may enter the baseline only after three identical complete runs; unexpected
  passes are baseline mismatches as well as unexpected failures. Advancing WPT,
  browser, reviewed realm patterns, or expectations is an explicit update.

## D-010 — Exercise the Observable WPT harness on Node 24

- **Status:** Accepted
- **Decision:** The repository tooling engine declaration includes Node 24,
  and the blocking and advisory Observable WPT workflows run their JavaScript
  tooling on Node 24.
- **Rationale:** Node 24 is an actively used development runtime, and the WPT
  commands must not require an engine-check bypass before their own
  prerequisites or tests can run.
- **Consequence:** WPT import verification, harness unit tests, doctor checks,
  and browser execution must work under Node 24. Existing Node 18 and Node 20
  development declarations remain in place. This decision does not settle the
  final runtime support matrix for published RxJS packages.

## D-011 — Make `test:wpt` the strict conformance command

- **Status:** Accepted
- **Decision:** `yarn test:wpt` and the blocking WPT CI job require every
  upstream Observable WPT test and subtest to pass. Any upstream failure,
  error, timeout, or not-run result exits nonzero. The current known-failure
  comparison remains available only as the explicitly named
  `yarn test:wpt:baseline` diagnostic.
- **Rationale:** A command named `test:wpt` should communicate actual WPT
  success or failure without requiring contributors to know that a passing
  process previously meant only “matches known failures.”
- **Consequence:** The default command prints progress, aggregate statuses,
  every non-passing URL and subtest, and artifact paths for diagnosis. It
  remains attested and fails independently for incomplete execution, native
  leakage, malformed reports, or runner failures. Baseline metadata remains
  useful for deliberate harness analysis but cannot make `test:wpt` pass.
- **Evidence:** On 2026-07-24 the fallback passed all 52 pinned URLs and all
  525 upstream subtests with 52/52 exact-identity attestations in Chrome for
  Testing `150.0.7871.126`. Three further identical complete runs supported
  removing the obsolete failure expectations.
