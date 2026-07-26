# RxJS Next open questions

These questions are intentionally unresolved. Future contributors must not
answer them implicitly through implementation. When a decision is made, update
`DECISIONS.md`, this file, the architecture, and the active project plan
together.

## Release-blocking package and runtime questions

### 1. What is the final package map?

Current facts:

- `@rxjs/observable-polyfill` contains the platform prototype.
- `rxjs` contains Symbol extensions and early compatibility primitives.
- `@rxjs/observable` is an inherited RxJS 7-style Observable core, remains in
  the workspace, and is still named in the root preparation script.

Decide:

- whether `@rxjs/observable` is removed, archived, renamed, or becomes part of
  the explicit compatibility product;
- whether the polyfill remains independently publishable;
- the name and dependency direction of the compatibility package;
- which package owns ambient TypeScript declarations.

### 2. How is native-versus-polyfill selection installed?

Decide whether users:

- import a dedicated polyfill entry point explicitly;
- receive a conditional fallback through the main `rxjs` entry point;
- use separate browser/server entry points; or
- use a loader that returns the selected constructor without global mutation.

The answer must cover detection, non-conforming native implementations, workers,
server runtimes, multiple realms, and test isolation.

### 3. What is the Symbol identity strategy?

The branch primarily uses `Symbol('name')`, while `buffer` uses
`Symbol.for('buffer')`.

An accepted constraint is that unrelated extensions must not be able to
overwrite one another merely by choosing the same descriptive name. Unique
Symbols provide that isolation because only code holding the exact key can
address its slot. `Symbol.for` makes a key recoverable by registry name and must
therefore justify the collision tradeoff.

Decide:

- unique module Symbols versus globally registered Symbols;
- registry key names, namespacing, and collision ownership if `Symbol.for` is
  used;
- behavior with duplicate RxJS copies or versions;
- whether symbols are stable across major versions;
- how symbols cross realms;
- whether patch installation is idempotent and how conflicting implementations
  are detected.

### 4. What does importing an extension guarantee?

Decide:

- whether every subpath imports the fallback installer;
- whether consumers must initialize Observable before any extension import;
- whether the root entry point installs all extensions or only exports Symbols;
- how tree shaking interacts with side-effectful prototype patching;
- whether patch properties are writable, configurable, enumerable, or guarded;
- what happens when the native prototype is non-extensible.

### 5. Which environments and module systems are supported?

Node 24 is now accepted and continuously exercised for repository tooling and
the Observable WPT harness. That does not answer the published-package support
question below.

Define minimum browser, worker, Node, Deno, and other runtime expectations,
including required support or fallback for `WeakRef`, `AbortSignal.any`,
`reportError`, `Symbol.dispose`, and DOM types. Also define ESM, CommonJS, and
bundler support before package exports are stabilized.

## Platform-layer design questions

### 6. Which specification revision completes the first conformance baseline?

The first test-harness revision is resolved: D-009 pins Observable WPT commit
`6a009d73f0d315941b90cac13a9523a2a08c631b`, and changes require an
explicit verified import and review. The harness can enforce its attested
failure baseline without claiming conformance.

Choose the matching Observable specification commit, the conformance threshold
and ownership for advancing both pins, and the browser-support policy after
the current fallback is ready for strict conformance work.

### 7. How are realms and subclasses preserved?

The prototype uses `this.constructor` to construct many results. Decide the
required behavior for:

- native subclasses;
- cross-realm Observable instances;
- borrowed Symbol methods;
- static methods invoked on subclasses;
- constructors with incompatible signatures;
- values converted through `Observable.from`.

### 8. How is each RxJS Symbol variant related to its platform counterpart?

D-002 and D-003 settle the general ownership model. The platform owns
string-named methods such as `.map` and `.filter`, and RxJS also exports
same-familiar-name Symbols so both `observable.map(project)` and
`observable[map](project)` exist. RxJS never replaces the string method. The
Symbol implementation may delegate to the platform implementation or supply a
richer RxJS contract.

Decide per overlapping operator:

- which inputs, overloads, return types, and edge cases the RxJS form adds;
- whether delegation is observable or merely an implementation detail;
- which behavior and type tests both forms share;
- how documentation distinguishes the two forms without implying false parity;
- how native and fallback test modes prove that installing the Symbol leaves
  the string-named platform method untouched.

### 9. What is the canonical extension implementation pattern?

The branch has both `create.ts` and
`util/create-operator-observable.ts`, inconsistent import extensions, and a mix
of static, instance, and standalone functions.

Define one pattern for:

- patch installation;
- ambient type augmentation;
- constructor selection;
- input conversion;
- cancellation wiring;
- error forwarding;
- tests;
- exports and documentation.

## Compatibility questions

### 10. What exactly does “as much RxJS 7 compatibility as possible” cover?

Choose the supported surface by category:

- `Observable`, `Subscription`, and teardown behavior;
- creation functions;
- pipeable operators and `OperatorFunction` types;
- subjects;
- schedulers and time;
- interop protocols;
- AJAX, fetch, and WebSocket helpers;
- import paths and deprecated aliases.

Each category needs a support status, not a blanket compatibility claim.

The framework-neutral testing and marble boundary is resolved by D-012 and
`TESTING_DESIGN.md`. Compatibility-specific test coverage still needs to be
classified in the compatibility ledger as APIs are restored.

### 11. What does a compatibility observable return?

Decide whether compatibility operators return:

- platform Observable instances with adapters;
- a cold compatibility subclass;
- a wrapper that exposes both platform and RxJS 7 contracts; or
- a distinct type requiring explicit conversion.

The answer controls sharing, cancellation, subject behavior, typing, and escape
back to the platform layer.

### 12. What are the pipeable operator type and execution contracts?

Define the equivalents of `OperatorFunction<T, R>`, `MonoTypeOperatorFunction`,
`pipe`, and `source.pipe(...)`, including whether they compose platform and
compatibility observables and how cancellation crosses the boundary.

### 13. Which RxJS 7 semantic differences are acceptable?

Establish a maintainer-approved policy for differences caused by:

- shared active producer work;
- ref counting;
- `AbortSignal` cancellation;
- teardown timing and ordering;
- synchronous reentrancy;
- error reporting;
- scheduler removal or redesign;
- native platform operator behavior.

## Delivery and migration questions

### 14. What is the final major version and support relationship with RxJS 7?

Confirm RxJS 9 or choose another name. Define RxJS 7 maintenance expectations,
pre-release naming, and whether compatibility packages share the same version.

### 15. How will migration be measured?

Choose representative applications, frameworks, bundle configurations, and
behavioral test suites. Define the acceptable level of automated migration and
the criteria for calling an application migrated.

### 16. How are Skills and MCP capabilities shipped?

After the runtime APIs stabilize, decide whether the tools are:

- included in an npm package;
- published as a separate plugin or package;
- generated from repository documentation;
- versioned with RxJS or independently;
- allowed to modify code, run migrations, inspect projects, or access external
  services.

This design is deferred and should not block runtime work.

The repository now contains a portable `rxjs-next-marble-migration` Skill as
source and has independently vetted it. That implementation does not settle
distribution, versioning, permissions, plugin packaging, or MCP capabilities;
those parts of this question remain deferred.
