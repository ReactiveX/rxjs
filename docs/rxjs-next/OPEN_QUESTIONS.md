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
imports initialize correctly.

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

### 4. Which specification revision completes the first conformance baseline?

The WPT harness pins commit
`6a009d73f0d315941b90cac13a9523a2a08c631b`. Choose the matching Observable
specification commit, the ownership and update policy for both pins, and the
browser-support policy for later revisions.

### 5. How are same-realm subclasses and borrowed methods preserved?

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

### 6. How is each RxJS Symbol variant related to its platform counterpart?

D-002 and D-003 settle the ownership model. The platform owns string-named
methods, and RxJS may export a same-familiar-name exact Symbol without changing
that method.

Decide per overlapping operator:

- added inputs, overloads, return types, and edge cases;
- whether delegation is observable or only an implementation detail;
- shared and distinct behavior/type tests;
- documentation that prevents false parity claims;
- native and fallback evidence that the platform method remains untouched.

### 7. What is the canonical extension implementation pattern?

Define one pattern for:

- patch installation and ambient type augmentation;
- constructor selection and input conversion;
- cancellation wiring and error forwarding;
- tests, exports, and documentation.

The async-iteration Symbols show how non-Observable results can subscribe
directly, but their current assignments do not settle the common installer.

## Delivery and migration questions

### 8. What is the final major version and support relationship with RxJS 7?

Confirm RxJS 9 or choose another name. Define RxJS 7 maintenance expectations
and pre-release naming. There is no compatibility package to version.

### 9. How will migration be measured?

Choose representative applications, frameworks, bundle configurations, and
behavioral suites. Define the acceptable level of automated migration and the
criteria for calling an application migrated.

### 10. How are Skills and possible MCP capabilities shipped?

D-008 makes robust migration Skills the intended assistance path and leaves
broader MCP support optional. After the runtime APIs stabilize, decide:

- plugin, package, or generated-document distribution;
- independent versus RxJS-coupled versioning;
- permissions to inspect, modify, test, or migrate projects;
- whether any MCP server is justified beyond the Skill portfolio;
- validation and review requirements for generated changes.

The repository's portable `rxjs-next-marble-migration` Skill is evidence for
the approach, not a decision about public distribution, permissions, or MCP
packaging.
