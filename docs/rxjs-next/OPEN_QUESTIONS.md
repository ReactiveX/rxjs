# RxJS Next open questions

These questions are intentionally unresolved. Future contributors must not
answer them implicitly through implementation. When a decision is made, update
`DECISIONS.md`, this file, the architecture, and the active project plan
together.

D-039 through D-041 resolve the P0.2 package and acquisition questions:

- the published runtime map is `@rxjs/observable-polyfill`, `rxjs`, and
  `@rxjs/test`;
- `@rxjs/observable` is removed and no RxJS 7 runtime compatibility
  package replaces it;
- the polyfill package owns the base ambient platform types;
- every public `rxjs` entry point conditionally initializes its own realm;
- an existing `Observable` or `EventTarget.when` is preserved without probing
  or replacement;
- the stable fallback marker and helper identify an RxJS-installed constructor;
- child and foreign realms are not traversed or transparently supported.

## Release-blocking package and runtime questions

### 1. What Symbol identity and installation details remain?

D-037 resolves the construction seam. Public operator and factory Symbols stay
exact and module-owned. Only the internal construction protocol uses
`Symbol.for('rxjs.kernel.create.v1')`.

D-041 separately uses
`Symbol.for('rxjs.observable.polyfill.info.v1')` for read-only fallback
metadata. That marker identifies the installed fallback; it does not globalize
public extension Symbols or attest conformance.

Still decide:

- whether public exact Symbols are stable across major versions;
- the supported behavior when multiple versions install different
  implementations under separate exact operator Symbols;
- whether a stronger marker is needed to distinguish an arbitrary callable in
  the construction-protocol slot;
- removal or correction of the unreviewed `Symbol.for('buffer')` exception;
- the common idempotent installer and conflict policy for public extensions;
- extension property descriptors and the exact diagnostic for unsupported
  non-extensible constructors or prototypes.

### 2. How are side-effectful extension modules built and shaken safely?

D-040 settles the public import contract: the root initializes the platform and
exports non-operator core values without installing the complete Symbol
catalog; each Symbol subpath initializes the platform and installs only its own
capability and required kernel dependencies.

Still decide:

- package `sideEffects` metadata and bundler fixtures;
- how the common installer reports exact-Symbol conflicts;
- duplicate-package and mixed ESM/CommonJS behavior for one-time extension
  side effects.

P0.3 proves that the root can remain operator-free, that generated declarations
preserve subpath-scoped augmentation, and that standalone ESM and CommonJS
imports initialize correctly. P0.4 additionally proves that mixed ESM/CommonJS
loads of the base fallback preserve one installation in either order. The open
question above is limited to public extension side effects, exact Symbols, and
independently bundled or version-skewed copies.

### 3. Which exact runtime versions and module systems are supported?

D-041 establishes the initial capability boundary: browser windows, worker
realms, and maintained Node releases are candidates when the required web
primitives exist. Deno, Bun, edge runtimes, hardened globals, and
non-extensible prototypes are unclaimed until tested.

Before the release support matrix stabilizes, define:

- minimum browser and maintained Node versions;
- the required or supplied behavior for `WeakRef`, `AbortSignal.any`,
  `reportError`, `Symbol.dispose`, `EventTarget`, and DOM types;
- ESM, CommonJS, and supported bundler guarantees;
- which browser and Node fixtures make those claims blocking.

## Platform-layer design questions

### 4. How are same-realm subclasses and borrowed methods preserved?

D-037 resolves `ColdObservable`: RxJS Symbol operators return plain
ColdObservables, while native string methods return fresh platform
Observables. D-041 rejects transparent cross-realm operation; each realm must
initialize itself.

Still decide the required same-realm behavior for:

- native subclasses;
- borrowed Symbol methods;
- static methods invoked on subclasses;
- constructors with incompatible signatures;
- values converted through `Observable.from`.

### 5. How is each RxJS Symbol variant related to its platform counterpart?

D-002 and D-003 settle the ownership model. The platform owns string-named
methods, and RxJS may export a same-familiar-name exact Symbol without changing
that method.

Decide per overlapping operator:

- added inputs, overloads, return types, and edge cases;
- whether delegation is observable or only an implementation detail;
- shared and distinct behavior/type tests;
- documentation that prevents false parity claims;
- native and fallback evidence that the platform method remains untouched.

### 6. What is the canonical extension implementation pattern?

Define one pattern for:

- patch installation and ambient type augmentation;
- constructor selection and input conversion;
- cancellation wiring and error forwarding;
- tests, exports, and documentation.

The async-iteration Symbols show how non-Observable results can subscribe
directly, but their current assignments do not settle the common installer.

## Delivery and migration questions

### 7. What is the final major version and support relationship with RxJS 7?

Confirm RxJS 9 or choose another name. Define RxJS 7 maintenance expectations
and pre-release naming. There is no compatibility package to version.

### 8. Which representative repositories and thresholds qualify migration?

D-046 resolves how migration is measured: deterministic transforms must pass
the mechanical fixture lane, and the complete workflow must pass the agent
outcome lane defined in `MIGRATION_TOOLING_DESIGN.md`. D-047 and P0.M5 select
the initial bounded qualification: four pinned application/library repositories
cover Vitest, Mocha, Jest, strong and weak coverage, cold, platform, mixed, and
unsupported contracts. All four Codex/ChatGPT runs passed the 14 semantic gate
families, including the required safe stop. This settles the P0 threshold only;
broader repository categories, capabilities, models, and reliability sampling
remain future release-planning questions.

### 9. Which final distribution channels and harness versions are supported?

D-046 resolves the product boundary: `packages/migrate/skill` is the single
canonical, package-versioned Skill; Codex, Claude Code, and Cursor receive thin
installed or synchronized adapters that preserve its digest. The deterministic
API and dry-run-first CLI remain subordinate engine surfaces. P0.M3 removed
the P0.M1 MCP prototype; it is not an accepted release surface.

P0.M4 records a tested installation/discovery snapshot for Codex, Claude Code,
and Cursor. P0.M5 records a Codex `0.146.0-alpha.3.1` outcome snapshot with
`gpt-5.6-sol`; it does not qualify Claude Code or Cursor outcomes. Final plugin
or marketplace distribution channels, harness support windows, and the
pre-release requalification policy remain open. Adding MCP later would require
a new accepted decision and product contract.
