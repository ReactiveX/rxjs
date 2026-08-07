# RxJS Next active project plan

## Current objective

Ship `@rxjs/agent-plugin@9.0.0-beta.1` as the official agent experience for
RxJS 7 and RxJS 9. The portable package follows Agent Plugins 1.0 and Agent
Skills, contains thirteen narrowly triggered skills, and exposes the
deterministic migration engine through a local read-only MCP server. A
digest-locked Claude Code adapter is generated from the same sources.

The earlier implementation diary is preserved at
[`archive/PROJECT_PLAN_THROUGH_9.0.0-beta.0.md`](./archive/PROJECT_PLAN_THROUGH_9.0.0-beta.0.md).
Retired product identifiers are generalized so the archive cannot be mistaken
for current package or command guidance.
Its P6.10 publication item is historical: `9.0.0-beta.0` is already live on
the npm `next` channel. Historical live-model qualification remains evidence
for the old migration workflow, not a release gate for this plugin.

## Status protocol

- `DONE`: completion bar met and evidence recorded.
- `NEXT`: the single active step.
- `PLANNED`: sequenced but not active.
- `BLOCKED`: an external action or explicit decision is required.

Keep exactly one `NEXT` item while the queue is open. A release or registry
mutation is not complete until its external result is verified.

## Phase 7 queue

| Status | ID    | Outcome                                                                                                                                         |
| ------ | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `DONE` | P7.1  | Roll the plan forward and accept the agent-plugin architecture, release matrix, promotion policy, and free deterministic qualification boundary |
| `DONE` | P7.2  | Build the portable `@rxjs/agent-plugin` package and generated versioned knowledge pipeline                                                      |
| `DONE` | P7.3  | Port the deterministic migration engine into the read-only migration MCP                                                                        |
| `DONE` | P7.4  | Ship the core migration, RxJS 7/9 authoring, review, testing, and performance skills                                                            |
| `DONE` | P7.5  | Ship debugging, API-design, framework-integration, and bundle-optimization skills                                                               |
| `DONE` | P7.6  | Validate the universal artifact and digest-locked Claude adapter                                                                                |
| `DONE` | P7.7  | Put the agent plugin front-and-center in package, migration, release, and `rxjs.dev` documentation                                              |
| `DONE` | P7.8  | Build a first-class expert knowledge layer with RxJS 7 authoring, concrete examples, common patterns, and deep progressive references           |
| `DONE` | P7.9  | Complete migration coverage across the full RxJS 7 public surface and make `ColdObservable` the conservative lifecycle default                  |
| `DONE` | P7.10 | Split debugging into dedicated RxJS 7 and RxJS 9 skills with timeline, stack, error-signature, and temporary instrumentation guidance           |
| `DONE` | P7.11 | Harden the packed migration MCP, consolidate deterministic engine evidence in the plugin, and retire the superseded workspace                   |
| `NEXT` | P7.12 | Publish and verify the four-package beta.1 train, then publish the RxJS 7 documentation-only backport                                           |

## P7.1 — Architecture rollover

Completion requires:

- D-046 is superseded by the portable plugin plus read-only migration MCP.
- The synchronized release matrix contains the polyfill, test helper, agent
  plugin, and `rxjs`, with `rxjs` published last.
- Package and website promotion is authorized without `postinstall`, install
  warnings, or runtime notices.
- Paid-model calls, model-backed evaluations, credits, and authenticated agent
  runs are prohibited as release requirements. Schema, fixture, package,
  protocol, compilation, and discovery-only checks remain blocking.
- The charter, architecture, compatibility policy, open questions, risks, and
  release guidance agree with this queue.

## P7.2 — Portable package and knowledge pipeline

Create `packages/agent-plugin` with npm name `@rxjs/agent-plugin`, Agent Plugin
name `rxjs`, version `9.0.0-beta.1`, root `plugin.json`, `skills/`, and
`mcp.json`. The npm artifact contains a prebuilt Node `>=22.13.0` stdio MCP
bundle and no postinstall step, public JavaScript library, or replacement CLI.

Generate versioned knowledge from RxJS exports, public declarations, package
documentation, migration evidence, and tests. Pin RxJS 7 guidance to tag
`7.8.2` at `e5351d02e225e275ac0e497c7b66eaa5f0c88791`; target RxJS 9 guidance at
`9.0.0-beta.1`. Generated catalogs must have reproducible digests and freshness
checks.

## P7.3 — Read-only migration MCP

Expose exactly four source-content tools:

- `migration_capabilities`
- `analyze_migration`
- `preview_migration`
- `validate_migration_contract`

The server receives no repository filesystem authority. Validate an entire
request before processing and refuse malformed or oversized batches without
partial output: at most 25 files, 512 KiB per file, and 2 MiB total. Preserve
the migrated engine's capability registry, diagnostics, idempotence,
candidate-output equivalence, behavior, and safe-stop semantics. Applying a
preview remains the host agent's reviewed edit.

## P7.4–P7.5 — Skill suite

Ship thirteen immediate `skills/` children with matching frontmatter names:

1. `migrate-rxjs-7-to-9`
2. `write-rxjs-7`
3. `write-rxjs-9`
4. `review-rxjs-9`
5. `review-rxjs-7`
6. `write-rxjs-9-tests`
7. `write-rxjs-7-tests`
8. `analyze-rxjs-performance`
9. `debug-rxjs-7`
10. `debug-rxjs-9`
11. `design-rxjs-library-apis`
12. `integrate-rxjs-frameworks`
13. `optimize-rxjs-bundles`

Keep each `SKILL.md` concise and route detailed, version-specific material to
focused references. Framework guidance covers Angular 22.1 and React 19.2
deeply, Vue 3.5 strongly, and Svelte 5.56 and SolidJS 1.9 lightly, plus
framework-neutral lifecycle, SSR, cancellation, and external-store rules.
Angular 22.1's declared RxJS peer range is `^6.5.3 || ^7.4.0`; the plugin must
not claim official RxJS 9 compatibility until Angular changes that contract.

## P7.6 — Deterministic packaging validation

Blocking checks are local and free:

- validate root manifests against vendored, digest-pinned Agent Plugins 1.0
  schemas;
- validate every skill with `skills-ref`, directory/name equality, reference
  resolution, progressive disclosure, and package containment;
- pack and audit the npm artifact for missing files, symlink escape, unbuilt
  sources, unexpected client-specific files, and undeclared runtime
  dependencies;
- launch the packed MCP server and test initialization, discovery, all four
  tools, malformed/refusal/size-limit paths, and clean shutdown;
- rerun deterministic migration fixtures and representative RxJS 7/9 examples;
- type-check framework examples at the pinned versions;
- validate the Claude adapter structurally and run `claude plugin validate`
  only when it is available without authentication or model use;
- perform Codex and Cursor discovery-only checks when locally available.

No command that invokes a model, consumes credits, requires paid
authentication, or grades nondeterministic model output is a release gate.

## P7.7 — Public promotion

Add a prominent agent-plugin callout and installation link to the repository
and `rxjs` package READMEs, RxJS 9 migration and API guides, `@rxjs/test`
documentation, beta release notes and npm metadata, and the `rxjs.dev`
homepage announcement bar, navigation, installation guide, and a dedicated
agent-plugin page. Do not add runtime or installation warnings.

After the plugin is publicly installable, backport the same notice to the RxJS
7 documentation line and release the documentation-only `rxjs@7.8.3` patch.

## P7.8 — First-class expert knowledge

The plugin is not release-ready merely because its manifests and MCP validate.
Before publication it must encode enough concrete RxJS judgment to improve an
agent's implementation and review work materially:

- add `write-rxjs-7` so authoring, review, and testing are first-class for both
  supported majors;
- provide good/bad TypeScript examples from every authoring and review skill;
- document common production patterns with version-correct examples for
  higher-order concurrency, sharing, error scope, resource wrapping,
  cancellation, state boundaries, input conversion, and readability;
- dedicate substantial guidance and examples to custom operator authoring for
  both majors, including notification forwarding, child ownership, teardown,
  reentrancy, user-callback errors, public type design, and tests;
- expand each skill into several focused references selected through explicit
  progressive-disclosure routing, rather than one catch-all reference;
- remove the duplicated generated `version-catalog.md` from every skill and
  generate only narrow catalogs where machine-derived data is operationally
  useful;
- make RxJS 9 authoring rules and the migration target contract agree, so a
  migration never generates code the authoring or review skills discourage;
- treat maintainer-reviewed guidance, current source/tests, and first-party
  maintainer writing as primary evidence, while recording genuinely contested
  advice for explicit expert review; and
- compile and run representative examples from the expanded guidance.

Completion evidence must include a reference inventory, example coverage by
skill, generated-content containment checks, and deterministic skill/package
validation. Paid or model-backed evaluation remains prohibited.

## P7.9 — Complete migration coverage and lifecycle selection

Generate a complete migration catalog from the pinned RxJS 7.8.2 public
declarations, parity evidence, and unsupported-surface policy. It must cover
every operator, root function/value/type, AJAX, fetch, WebSocket, testing,
scheduler, interop, deep-import, and deprecated-alias concern. Each surface has
an explicit target/disposition even when no mechanical transform is safe.

Keep complete coverage distinct from automatic rewriting. The mechanically
supported registry remains limited to fixture-proved mappings and refuses
unproved overloads or syntax. Advance its version when emitted lifecycle or
invocation policy changes.

Make `ColdObservable` plus exact Symbols the default for ordinary RxJS 7
Observable-producing code. Permit platform promotion only with characterized
sharing/multicasting evidence or a repository-wide single-subscriber proof.
Platform-promoted output prefers proved native methods for bundle size; cold
output must not cross lifecycle accidentally through a native string method.
The MCP reports catalog guidance, sharing indicators, and local subscriber
topology without claiming that file-local syntax proves a global contract.

Completion requires declaration-to-catalog completeness tests, mode-specific
engine/MCP fixtures, exact-output preservation, updated migration Skills and
public guidance, package/adapter digest validation, and the deterministic free
package gate. No model or paid evaluation runs.

## P7.10 — Version-specific debugging

Replace the overlapping cross-version debugger with dedicated RxJS 7 and
RxJS 9 skills. Both skills must teach agents to treat a call stack as one
synchronous slice and reconstruct concurrency from a stable, ordered event
timeline. Include common error signatures, subscription/producer identity,
recovery and higher-order boundaries, cancellation and teardown ownership,
Subjects, sharing, synchronous reentrancy, and symptom-driven experiments.

Provide temporary `tap` logging for both versions and platform `.inspect()`
where its RxJS 9 lifecycle fits. Require probes to be lightweight,
non-throwing, removed after diagnosis, and followed by a probe-free
reproduction because logging and debugger pauses can perturb fast systems.
RxJS 9 guidance must preserve the distinction between a platform Observable
and `ColdObservable` and use the exact imported `tap` Symbol.

Completion requires non-overlapping triggers, progressive references,
deterministic expert-guidance assertions, updated package/adapter inventories,
and the free package validation gate.

## P7.11 — MCP hardening and workspace retirement

Consolidate the reusable migration engine, fixtures, schema contracts, type
evidence, behavior comparisons, and lifecycle checks in the plugin. Exercise
the packed stdio artifact—not only in-process services—across initialization,
tool discovery, annotations, schemas, every tool, text/structured parity,
malformed calls, exact batch boundaries, every structured refusal, safe stops,
and clean shutdown.

Remove the superseded workspace, CLI, generated local skill, package docs,
tests, release entries, budgets, and coherence assumptions. CI and release
readiness must run the plugin's deterministic package gate. A repository
fitness check prevents the retired product name, path, or binaries from being
reintroduced. Historical design evidence remains in Git history.

## P7.12 — Publication and RxJS 7 documentation backport

Prepare and publish `9.0.0-beta.1` in this order:

1. `@rxjs/observable-polyfill`
2. `@rxjs/test`
3. `@rxjs/agent-plugin`
4. `rxjs`

Publication, GitHub release creation, and the branch backport are deliberate
external operations; they are never inferred from a passing local build.

## Follow-on ideas outside beta.1

- Skills for timeline visualization, web-platform interop, and production
  observability.
- MCP tools for versioned API lookup/comparison, project-wide usage inventory,
  profile and heap-trace analysis, bundle-stat analysis, and marble rendering.

Add MCP only when structured tooling materially improves on skill guidance and
ordinary agent tools.

## Risks

| Risk                                                       | Response                                                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| RxJS 7 and RxJS 9 semantics are mixed                      | Keep version-specific skills and references; generated catalogs carry exact source/version provenance                 |
| An MCP preview is mistaken for a complete migration        | Require lifecycle classification, reviewed application, characterization tests, and safe-stop diagnostics             |
| Plugin artifacts drift across clients                      | Generate the Claude adapter from the universal artifact and compare skills, MCP bytes, version, and knowledge digests |
| The package silently gains filesystem or install authority | Source-content-only MCP inputs, no postinstall, package inventory audit, and subprocess tests                         |
| Documentation promotion becomes an install-time nuisance   | Promote in package/site documentation only; prohibit runtime and postinstall notices                                  |
| Paid evaluations become a hidden release cost              | Keep every blocking gate deterministic, local, and free                                                               |
| Users expect the removed standalone CLI                    | Keep the plugin migration Skill and read-only MCP prominent; preserve safe, reviewed application through host tools   |

## Session log

### 2026-08-07 — Phase 7 rollover started

- Confirmed `9.0.0-beta.0` is live for the existing synchronized package train,
  so the stale P6.10 item is already satisfied.
- Archived the full Phase 0–6 plan and replaced the active queue with the
  agent-plugin transition.
- Began the controlling architecture, package, validation, promotion, release,
  and retirement updates under P7.1.

### 2026-08-07 — P7.1 architecture rollover

- Recorded D-060 through D-063 for the portable plugin, read-only migration
  MCP, synchronized transition, deterministic no-paid qualification boundary,
  and prominent package/site promotion.
- Superseded D-046 and D-047, revised D-052, D-053, and D-058, and reconciled
  the charter, architecture, compatibility policy, risks, and open questions.
- Pruned resolved questions and preserved publication, deprecation, workspace
  removal, and RxJS 7 backport as explicit post-verification work.
- Marked P7.1 complete and advanced P7.2 as the sole `NEXT` item.

### 2026-08-07 — P7.2 through P7.7 implementation

- Added the portable beta.1 package, generated export/evidence knowledge,
  prebuilt read-only MCP, the initial twelve-Skill suite, and copied mechanical
  fixtures with exact-output equivalence coverage.
- Added pinned schema/Skill/package/MCP/framework validation and a generated
  Claude adapter with byte-level artifact digests and a `git-subdir`
  marketplace entry. No model or paid evaluation ran.
- Added prominent repository, package, migration, testing, release-note, and
  `rxjs.dev` promotion without postinstall or runtime warnings.
- Prepared synchronized manifests and release ordering. Publication still
  requires clean-checkout registry verification.

### 2026-08-07 — P7.8 knowledge-depth reset

- Accepted expert review that the mechanically conformant plugin was not yet a
  first-class RxJS knowledge product: it lacked RxJS 7 authoring, sufficient
  code examples, common-pattern guidance, custom-operator depth, and meaningful
  progressive references.
- Inserted P7.8 ahead of publication, made it the sole `NEXT`, and moved
  publication and retirement to the then-current P7.9 and P7.10.
- Required targeted generated references instead of copying one broad export
  catalog into every skill, and required migration output to follow the same
  target-authoring rules as new RxJS 9 code.

### 2026-08-07 — P7.8 expert knowledge completed

- Expanded the initial twelve skills into 89 focused authored/generated references,
  with every reference linked through progressive-disclosure routing and no
  duplicated `version-catalog.md` files.
- Added first-class RxJS 7 authoring; good/bad and production-pattern guidance;
  public custom-operator authoring for both majors; class and readonly-tuple
  controller patterns; and deep debugging, performance, API, framework, and
  bundle guidance.
- Recorded platform-method-first RxJS 9 guidance and D-064, including
  `.map()`/`.filter()` migration output, exact `[takeUntil]` preservation,
  browser bundle rationale, `ColdObservable` exceptions, and explicit
  `Symbol.for()` collision/version hazards.
- Made sequential flattening the safety baseline while documenting intentional
  parallelization, action locking, and switching. Reframed tests around public
  product/custom-operator contracts rather than re-testing RxJS operators.
- Standardized RxJS 7 and RxJS 9 marble examples on named variables declared
  together and vertically aligned with ignored whitespace. Added an executable
  subscription-marble owner-abort example.
- Deterministic evidence: Agent Plugin/Skill schemas and containment passed;
  exact framework pins type-checked; 33 plugin tests passed; the 111-file packed
  artifact and MCP lifecycle passed; and all 166 standalone migration tests
  passed. No model, paid-token, or authenticated evaluation ran.
- Marked P7.8 complete and advanced registry publication/verification as the
  sole `NEXT` item. Publication remains an explicit operator action.

### 2026-08-07 — P7.8 synchronous feedback refinement

- Added focused RxJS 7 and RxJS 9 authoring and testing references for
  synchronous side effects, indirect reentrancy, and subject-primed “snake
  eating its tail” feedback machines.
- Extended migration, review, and debugging guidance with subscribe-before-
  prime ordering, per-cycle collection, concurrency policy, and the distinct
  terminal meanings of Subject completion, Subject error, and owner
  cancellation.
- Deterministic evidence now covers 93 focused references, 39 plugin tests,
  and a 115-file packed artifact. P7.9 remains the sole `NEXT` item.

### 2026-08-07 — P7.9 complete migration coverage

- Generated a digest-locked catalog for all 248 named exports across the six
  pinned RxJS 7.8.2 public entry points: 114 operator functions, 37 other
  functions, 70 types, and 27 other runtime values. Every surface records a
  lifecycle-aware target and disposition; only 10 fixture-proved mappings are
  mechanical.
- Recorded D-065 and made `ColdObservable` plus exact Symbols the default.
  Sharing constructs and a file-local single subscriber are platform
  candidates only; platform promotion still requires behavioral or
  repository-wide evidence. Explicit platform mode prefers proved native
  methods for smaller browser bundles.
- Advanced both engine copies to capability registry `1.1.0`, retained
  candidate-output equivalence, and added declaration-completeness, topology,
  sharing, default-mode, and mode-specific invocation tests.
- Deterministic evidence: all 46 plugin tests, schema/Skill/framework/type
  checks, the 116-file packed artifact and MCP lifecycle, the then-current
  standalone engine suite, and the RxJS migration-guide type check passed. No
  model, paid-token, authenticated, or credit-consuming evaluation ran.
- Marked P7.9 complete and advanced synchronized beta.1 publication and
  registry verification as the sole `NEXT` item.

### 2026-08-07 — P7.10 version-specific debugging

- Replaced the overlapping `debug-rxjs` trigger with `debug-rxjs-7` and
  `debug-rxjs-9`, bringing the package to thirteen Skills and 100 focused
  references.
- Added stack-phase interpretation and common error signatures for each major,
  plus timeline-first diagnosis for subscriptions, producer activations,
  higher-order inners, cancellation, teardown, sharing, Subjects, and
  synchronous reentrancy.
- Added temporary RxJS 7 `tap` and RxJS 9 `.inspect()`/exact `[tap]`
  instrumentation. The guidance requires non-throwing compact probes, warns
  that logs and debugger pauses perturb timing, and requires verification after
  all diagnostic code is disabled and removed.
- Recorded D-066, updated the universal and Claude inventories and digests, and
  added deterministic content assertions for both debugging skills.
- Deterministic evidence: Agent Plugin/Skill schemas validated all 13 Skills;
  package and framework type checks passed; all 46 plugin tests passed; and the
  124-file packed artifact and MCP lifecycle passed. No model, paid-token,
  authenticated, or credit-consuming evaluation ran.
- Marked P7.10 complete and restored synchronized beta.1 publication and
  registry verification as the sole `NEXT` item.

### 2026-08-07 — P7.11 migration MCP hardening and retirement

- Expanded the plugin to 114 deterministic tests covering exact fixture bytes
  and diagnostics, idempotence and negative controls, contract schemas and
  readiness, pinned RxJS 7.8.2 behavior, source/target type evidence, lifecycle
  contracts, and byte-accurate batch boundaries.
- Expanded the packed stdio gate to inspect all four tool schemas and read-only
  annotations; call every tool; compare text and structured content; exercise
  framework adaptation, safe stops, exact file/count/total limits, all
  post-schema structured refusal codes, malformed protocol inputs, atomic rejection, and
  clean shutdown.
- Removed the superseded workspace, CLI, generated local skill, release and CI
  entries, documentation ownership, budgets, and package-coherence rules. The
  four-package release train and plugin package gate are now the only active
  path.
- Packed all four beta.1 artifacts and installed them into an isolated offline
  consumer. ESM, Node `require(esm)`, public types, marble testing, and the
  20,083-byte browser bundle passed; all tarballs remained within budget.
- No model, paid-token, authenticated, or credit-consuming evaluation ran.
- Marked P7.11 complete and advanced four-package beta.1 publication and the
  RxJS 7 documentation backport as the sole `NEXT` item.
