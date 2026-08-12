# RxJS Next project charter

## Executive summary

RxJS Next will make the web-platform `Observable` the foundation of RxJS
instead of shipping a competing observable type. RxJS will provide a polyfill
when the platform does not provide `Observable`, and will add its broader
reactive-programming capabilities through Symbol-keyed extensions.

RxJS Next will not ship a separate RxJS 7 runtime-compatibility library.
Producer-per-subscription values, Subjects, Symbol-keyed composition, and
other useful library capabilities may remain first-class RxJS Next APIs, but
they are specified on their own terms rather than as a blanket emulation
promise. Migration from RxJS 7 will instead be supported by documentation and
an agent-first workflow: one canonical portable Skill directs reviewed project
work while deterministic one-time transforms handle only bounded source
rewrites.

The working project name is **RxJS Next**. The public version is RxJS 9 because
a cancelled RxJS 8 line already exists and reusing that version would create
avoidable confusion. The first planned prerelease is `9.0.0-beta.0`; the
release must explain prominently that RxJS 8 was paused while the web-platform
Observable was finalized and that RxJS 9 is the new platform-based generation.

D-053 fixes the initial release matrix: one ESM implementation serves Node
`22.13+`/24, latest stable Chrome and Firefox, current desktop and Mobile
Safari, Webpack 5, Deno, and Bun. Node 26 is advisory during beta. Browser,
Webpack, `import`, and the Node `require(esm)` bridge resolve the same files;
no CommonJS or runtime-specific code copy is published.

## Why this work exists

RxJS 8 development stopped while Observable was being standardized for the web
platform. The platform design evolved away from important RxJS 7 assumptions,
especially around the subscription lifecycle and sharing of active producer
work.

Restarting the library on top of the platform primitive has three benefits:

- RxJS values can participate directly in browser and other web-compatible
  APIs without an adapter-defined competing base class.
- Applications can avoid paying for a second foundational Observable
  implementation when the runtime already supplies one.
- RxJS can focus on the high-value library layer: operators, composition,
  migration, testing, and developer tooling.

## Goals

1. **Platform foundation.** Preserve the runtime's existing web-platform
   `Observable` whenever it is available.
2. **Conforming fallback.** Provide a polyfill when `Observable` is absent. The
   polyfill should ultimately pass the important Observable Web Platform Tests.
   The test harness is pinned independently from the later work required to
   make the current fallback conform.
3. **Symbol-based extension.** Install RxJS operators, factories, and helpers on
   the active Observable constructor or prototype with exported Symbols rather
   than string-named prototype additions.
4. **Operator continuity.** Re-establish the useful RxJS operator catalog and
   validate it against the former RxJS 7 behavior tests, allowing explicit
   differences required by platform sharing and cancellation semantics.
5. **Intentional library APIs.** Keep useful APIs such as `ColdObservable`,
   Subjects, and Symbol-keyed `pipe` when they have explicit RxJS Next
   contracts, without presenting them as a separate RxJS 7 compatibility
   surface.
6. **Migration intelligence.** Ship a robust, reviewable agent-first workflow
   that helps users apply RxJS Next and migrate from RxJS 7. Keep lifecycle
   classification explicit, deterministic rewrites bounded, test-framework
   syntax adaptable, and project writes under host-agent review.
7. **AI-ready development.** Keep project intent, architecture, decisions,
   tests, and open questions explicit enough for AI-assisted implementation to
   be safe and reviewable.

## Non-goals for the foundation phase

- Treating the completed test-only harness and its reviewed failure baseline as
  proof that the current fallback already conforms.
- Implementing or qualifying migration surfaces beyond the canonical Skill,
  deterministic engine, and supported harness adapters selected for the
  foundation release.
- Shipping a runtime package that emulates the RxJS 7 public API, import map,
  subscription facade, pipeable-operator surface, or scheduler system.
- Claiming complete RxJS 7 behavioral compatibility on the platform
  `Observable`.
- Preserving every RxJS 7 internal class, scheduler mechanism, import path, or
  implementation technique.
- Treating the exploratory branch's package names, `8.0.0-alpha` versions, or
  exports as final.
- Changing, building, publishing, or redesigning the `rxjs.dev` documentation
  site during this plan. Package-relative documentation belongs inside the
  corresponding package container; repository-wide governance remains under
  `docs/rxjs-next`.
- Freezing the upstream Observable proposal. The project must expect the
  specification and tentative WPT suite to evolve.

## Architectural principles

### One platform identity

Every public `rxjs` entry point conditionally initializes the web-platform
Observable constructor for its current realm and must not introduce a
competing RxJS constructor. Any existing constructor is preserved without
probing or replacement. Each window, iframe, worker, or server isolate
initializes independently; RxJS does not traverse child realms or promise
transparent cross-realm Observable support.

### Extensions are explicit

RxJS extensions are addressed by imported Symbols. A module may install the
implementation as an import side effect, but consumers should be able to see
which capability they import and which Symbol they invoke.

The Symbol catalog includes counterparts for platform operators such as `map`
and `filter`. The platform form and RxJS form coexist:
`observable.map(project)` uses the platform contract, while
`observable[map](project)` uses the RxJS contract. This gives users a uniform
Symbol-based style across the whole RxJS operator catalog. The RxJS form may
delegate when the platform contract is sufficient or provide additional
functionality under its separate key; it must not overwrite the string-named
platform method.

This makes side-effect patching collision-safe: a Symbol property can be
overwritten only by code that has obtained that exact Symbol value. Another
library can use the same human-readable Symbol description without touching the
RxJS implementation. This avoids the shared string-key namespace that made the
RxJS 5 `rxjs/add/operator/*` patching model vulnerable to load-order collisions
and accidental replacement.

### Platform behavior stays platform behavior

The platform Observable is shared while an active producer subscription exists
and is ref-counted by its observers. RxJS operators on that surface must work
with that model. A first-class API such as `ColdObservable` may deliberately
create a producer per direct subscription, but that contract remains explicit
in its type and does not redefine the platform Observable.

### Cancellation is signal-based

Platform-layer cancellation and teardown flow through `AbortSignal`,
`Subscriber.signal`, and `Subscriber.addTeardown()`. RxJS Next does not ship a
legacy `Subscription.unsubscribe()` facade that redefines that lifecycle.

### Behavior is proved, not implied

The platform implementation is governed by a pinned specification/WPT baseline.
The operator library is governed by focused unit tests plus classified RxJS 7
behavioral evidence. Passing former tests proves only the represented behavior;
it does not create an RxJS 7 runtime-compatibility claim.

### Packaging is part of architecture

Entry points determine whether a polyfill is installed, which global is
patched, whether tree shaking works, and whether duplicate Symbols can exist.
Package manifests and import behavior therefore require the same review as
runtime code.

## Quality attributes

| Attribute           | Required outcome                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Platform fidelity   | The fallback matches the pinned Observable specification and selected WPT baseline; native behavior remains untouched              |
| Interoperability    | Operators accept platform `Observable` values and preserve the appropriate constructor/realm                                       |
| Product focus       | Intentional RxJS Next APIs are specified directly; no runtime-emulation product is implied                                         |
| Extensibility       | A new operator can be added through one documented Symbol-extension pattern                                                        |
| Testability         | Native, polyfilled, producer-per-subscription, shared-active-producer, cancellation, and type behavior can be tested independently |
| Packaging integrity | Every published entry point builds, has correct types, declares runtime dependencies, and works in supported module systems        |
| Migration clarity   | Every material RxJS 7 difference has a documented migration path or an explicit unsupported status                                 |
| AI change safety    | A contributor can find the controlling decision, active plan item, invariants, and validation gate before editing                  |

## Success criteria

The project is ready for a major release when:

- supported runtimes consistently use native Observable or the conforming
  fallback according to the documented installation contract;
- the selected WPT baseline passes at the agreed threshold;
- every published Symbol extension follows one identity, installation,
  constructor-preservation, cancellation, and typing convention;
- the supported operator set passes its rewritten or retained RxJS 7 tests,
  with intentional semantic differences recorded;
- all documented public entry points build and pass import/type tests in every
  supported environment;
- migration documentation explains sharing, cancellation, pipeable operators,
  subjects, and other accepted breaking changes;
- the canonical migration Skill and deterministic engine pass their mechanical
  fixture gates; the Skill passes Codex, Claude Code, and Cursor installation
  and discovery gates; and the representative Codex/ChatGPT outcome lane
  passes its declared safety gates;
- no unresolved release-blocking decision remains in `OPEN_QUESTIONS.md`.

## Stakeholders and audience

The primary audience is RxJS maintainers and contributors implementing the new
generation. Secondary audiences are framework/library integrators, large RxJS 7
users planning migrations, standards contributors, and AI coding agents working
under maintainer review.

Ownership, staffing, dates, and release commitments have not yet been assigned.
