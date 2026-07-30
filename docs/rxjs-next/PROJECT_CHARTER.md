# RxJS Next project charter

## Executive summary

RxJS Next will make the web-platform `Observable` the foundation of RxJS
instead of shipping a competing observable type. RxJS will provide a polyfill
when the platform does not provide `Observable`, and will add its broader
reactive-programming capabilities through Symbol-keyed extensions.

The project also intends to provide a separate compatibility layer for
applications migrating from RxJS 7. That layer should preserve as much of the
RxJS 7 structure, pipeable operator experience, and behavior as is practical
without weakening or disguising platform semantics.

The working project name is **RxJS Next**. The likely public version is RxJS 9
because a cancelled RxJS 8 line already exists and reusing that version would
create avoidable confusion. The final version number remains a release
decision.

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
  compatibility, migration, testing, and developer tooling.

## Goals

1. **Platform foundation.** Use the runtime's native web-platform `Observable`
   whenever it is available and suitable.
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
5. **Separate backward compatibility.** Provide an additional library that
   preserves as much RxJS 7 behavior and structure as practical.
6. **Pipeable migration path.** Support RxJS 7-style pipeable operators in the
   compatibility work so large applications can migrate incrementally.
7. **Migration intelligence.** Eventually ship Skills and MCP capabilities that
   help users apply the library correctly and migrate from RxJS 7. Their
   packaging, APIs, and permissions are deferred.
8. **AI-ready development.** Keep project intent, architecture, decisions,
   tests, and open questions explicit enough for AI-assisted implementation to
   be safe and reviewable.

## Non-goals for the foundation phase

- Treating the completed test-only harness and its reviewed failure baseline as
  proof that the current fallback already conforms.
- Designing the final Skills or MCP products.
- Claiming complete RxJS 7 behavioral compatibility on the platform
  `Observable`.
- Preserving every RxJS 7 internal class, scheduler mechanism, import path, or
  implementation technique.
- Treating the exploratory branch's package names, `8.0.0-alpha` versions, or
  exports as final.
- Redesigning the documentation website or release process before the runtime
  and package boundaries are stable.
- Freezing the upstream Observable proposal. The project must expect the
  specification and tentative WPT suite to evolve.

## Architectural principles

### One platform identity

The main entry point selects the web-platform Observable constructor for the
current realm and must not introduce a competing RxJS constructor. If a
conforming native implementation is present, RxJS must not replace it.
Cross-realm values and constructor selection require an explicit policy before
the API is stabilized.

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
and is ref-counted by its observers. RxJS operators in the platform layer must
work with that model. Compatibility behavior that needs a producer per
subscriber belongs in the compatibility layer.

### Cancellation is signal-based

Platform-layer cancellation and teardown flow through `AbortSignal`,
`Subscriber.signal`, and `Subscriber.addTeardown()`. A legacy
`Subscription.unsubscribe()` facade may exist in the compatibility layer, but
it must not redefine the platform lifecycle.

### Behavior is proved, not implied

The platform implementation is governed by a pinned specification/WPT baseline.
The operator library is governed by focused unit tests plus a classified subset
of RxJS 7 tests. Compatibility claims require an explicit ledger of supported
behavior and intentional differences.

### Packaging is part of architecture

Entry points determine whether a polyfill is installed, which global is
patched, whether tree shaking works, and whether duplicate Symbols can exist.
Package manifests and import behavior therefore require the same review as
runtime code.

## Quality attributes

| Attribute              | Required outcome                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Platform fidelity      | The fallback matches the pinned Observable specification and selected WPT baseline; native behavior remains untouched              |
| Interoperability       | Operators accept platform `Observable` values and preserve the appropriate constructor/realm                                       |
| Explicit compatibility | RxJS 7 emulation is opt-in and cannot be mistaken for native behavior                                                              |
| Extensibility          | A new operator can be added through one documented Symbol-extension pattern                                                        |
| Testability            | Native, polyfilled, producer-per-subscription, shared-active-producer, cancellation, and type behavior can be tested independently |
| Packaging integrity    | Every published entry point builds, has correct types, declares runtime dependencies, and works in supported module systems        |
| Migration clarity      | Every material RxJS 7 difference has a documented migration path or an explicit unsupported status                                 |
| AI change safety       | A contributor can find the controlling decision, active plan item, invariants, and validation gate before editing                  |

## Success criteria

The project is ready for a major release when:

- supported runtimes consistently use native Observable or the conforming
  fallback according to the documented installation contract;
- the selected WPT baseline passes at the agreed threshold;
- every published Symbol extension follows one identity, installation,
  constructor-preservation, cancellation, and typing convention;
- the supported operator set passes its rewritten or retained RxJS 7 tests,
  with intentional semantic differences recorded;
- the compatibility package has an explicit support matrix and passes its
  claimed RxJS 7 behavior suite;
- all documented public entry points build and pass import/type tests in every
  supported environment;
- migration documentation explains sharing, cancellation, pipeable operators,
  subjects, and other accepted breaking changes;
- the Skills and MCP deliverables, if included in the release, have their own
  product contract and validation;
- no unresolved release-blocking decision remains in `OPEN_QUESTIONS.md`.

## Stakeholders and audience

The primary audience is RxJS maintainers and contributors implementing the new
generation. Secondary audiences are framework/library integrators, large RxJS 7
users planning migrations, standards contributors, and AI coding agents working
under maintainer review.

Ownership, staffing, dates, and release commitments have not yet been assigned.
