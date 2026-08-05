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

### 1. Which Symbol identity and installation policy applies?

D-037 resolves the construction seam. Public operator and factory Symbols stay
exact and module-owned. Only the internal construction protocol uses
`Symbol.for('rxjs.kernel.create.v1')`.

D-041 separately uses
`Symbol.for('rxjs.observable.polyfill.info.v1')` for read-only fallback
metadata. That marker identifies the installed fallback; it does not globalize
public extension Symbols or attest conformance.

D-048 completes the public identity policy. Exact extension Symbols are stable
through one loaded module export, not across independently evaluated dialects,
package copies, or versions. Those copies install separate exact slots and can
coexist. No public capability uses the global registry; the former
`Symbol.for('buffer')` exception is removed. The construction ABI continues to
accept an existing callable without a stronger package marker. D-051
supersedes D-048's transactional installation mechanism: public capabilities
use direct assignment under their module-owned Symbols, with no common
installer, collision preflight, descriptor customization, or rollback.

### 2. How are side-effectful extension modules built and shaken safely?

D-040 settles the public import contract: the root initializes the platform and
exports non-operator core values without installing the complete Symbol
catalog; each Symbol subpath initializes the platform and installs only its own
capability and required kernel dependencies.

D-048 decides that the `rxjs` package is side-effectful: every entry point
initializes the realm, and extension subpaths additionally install one exact
capability. Direct subpaths provide granularity. A bundler fixture must retain
an otherwise unused extension import and keep the root operator-free. Mixed
ESM/CommonJS and duplicate copies use different public Symbols while sharing
only the D-037 construction ABI. Their public capabilities coexist because
their exact Symbols differ, not because a runtime installer arbitrates
conflicts.

P0.3 proves that the root can remain operator-free, that generated declarations
preserve subpath-scoped augmentation, and that standalone ESM and CommonJS
imports initialize correctly. P0.4 additionally proves that mixed ESM/CommonJS
loads of the base fallback preserve one installation in either order. The open
question is resolved by the P2 package, duplicate-load, and bundler fixtures.

### 3. Which exact runtime versions and module systems are supported? — Resolved

D-053 accepts Node `>=22.13.0` on the Node 22 line and maintained Node 24 as
blocking, with Node 26 advisory during beta. The published distribution is one
ESM implementation; browser, Webpack, `import`, and Node `require(esm)`
conditions resolve that same output. Latest stable Chrome and Firefox, current
desktop and Mobile Safari, current stable Deno and Bun, and Webpack 5 are
blocking. The pinned Chrome WPT run remains the reproducible conformance gate.

The supported environments must supply `WeakRef`, `AbortSignal.any`,
`Symbol.dispose`, `EventTarget`, and the applicable DOM types. RxJS retains its
accepted `reportError` fallback where the host does not expose the global.
Support adds no environment-specific shipped code. Edge runtimes, hardened
globals, non-extensible targets, and transparent cross-realm behavior remain
unclaimed.

## Platform-layer design questions

### 4. How are same-realm subclasses and borrowed methods preserved?

D-037 resolves `ColdObservable`: RxJS Symbol operators return plain
ColdObservables, while native string methods return fresh platform
Observables. D-041 rejects transparent cross-realm operation; each realm must
initialize itself. D-049 completes the kernel policy. Derived construction
uses the receiver's `[create]` protocol; a compatible same-realm subclass is
preserved by the inherited implementation, and a custom implementation may
select another result contract. Static Symbols follow their static receiver.
Incompatible constructors and generic borrowing onto unrelated objects are
unsupported. Input conversion is deliberately separate and always uses the
active realm's platform `Observable.from`.

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

P2.4 settled the pilot `map` overlap and D-059 later removed its inherited
RxJS 7 callback-receiver argument. The exact RxJS Symbol form supplies the
RxJS projection index, constructs through `[create]`, and follows the platform
layer's shared activation contract. It does not delegate to or replace the
string-named platform `map`; native and fallback kernel evidence verifies that
the original method and descriptor remain unchanged. Other overlapping
operators still require the same per-capability record before they are
restored.

### 6. What is the canonical extension implementation pattern?

D-048, D-049, and D-051 define the pattern. A subpath exports one exact Symbol,
augments only the corresponding ambient interface, and assigns its
implementation directly to the active constructor or prototype under that
Symbol. Observable-returning implementations create through the receiver's
`[create]`, normalize inputs through the active platform `Observable.from`,
own upstream work with the derived subscriber's signal plus any joined local
controller, and forward synchronous setup or callback failures through
`subscriber.error`. P2.4 validates the operator-kernel behavior; P4.I1 completed
the installation simplification for all 97 exact public Symbols, with source,
package, bundler, and native/fallback gates. Async-iteration Symbols remain a
documented non-Observable-result variant because they return generators rather
than derived Observables.

## Delivery and migration questions

### 7. What is the support relationship with RxJS 7? — Resolved

D-007 resolves the release identity as RxJS 9 and selects `9.0.0-beta.0` as the
first planned prerelease. Release documentation must explain that the earlier
RxJS 8 effort was paused while web-platform Observable work was finalized and
that RxJS 9 is the new platform-based generation. D-053 keeps RxJS 7 on
`latest` during the RxJS 9 beta and continues security plus high-severity
correctness or ecosystem-compatibility fixes. RxJS 7 remains maintained after
RxJS 9 becomes stable; no sunset date is part of this release. There is no
compatibility package to version.

### 8. Which representative repositories and thresholds qualify migration?

D-046 resolves how migration is measured: deterministic transforms must pass
the mechanical fixture lane, and the complete workflow must pass the agent
outcome lane defined in `packages/migrate/docs/MIGRATION_TOOLING_DESIGN.md`.
D-047 and P0.M5 select
the initial bounded qualification: four pinned application/library repositories
cover Vitest, Mocha, Jest, strong and weak coverage, cold, platform, mixed, and
unsupported contracts. All four Codex/ChatGPT runs passed the 14 semantic gate
families, including the required safe stop. This settles the P0 threshold only;
broader repository categories, capabilities, models, and reliability sampling
remain future release-planning questions.

### 9. Which migration-harness versions and marketplaces are supported?

D-046 resolves the product boundary: `packages/migrate/skill` is the single
canonical, package-versioned Skill; Codex, Claude Code, and Cursor receive thin
installed or synchronized adapters that preserve its digest. The deterministic
API and dry-run-first CLI remain subordinate engine surfaces. P0.M3 removed
the P0.M1 MCP prototype; it is not an accepted release surface.

Distribution channels are resolved by D-053: RxJS 9 prereleases use npm
`next`, RxJS 7 remains npm `latest` during beta, and the four packages version
together. P0.M4 records a tested installation/discovery snapshot for Codex, Claude Code,
and Cursor. P0.M5 records a Codex `0.146.0-alpha.3.1` outcome snapshot with
`gpt-5.6-sol`; it does not qualify Claude Code or Cursor outcomes. Plugin or
marketplace distribution, harness support windows, and requalification beyond
the committed beta evidence remain open. Adding MCP later would require a new
accepted decision and product contract.
