# TestScheduler and marble-test migration

Use this reference only for selected RxJS 7 `TestScheduler` or marble tests.
Preserve behavioral evidence and the project's ordinary test conventions.

## Preserve the outer framework

Keep the project's `describe`, `it`, `test`, hooks, assertion library, spies,
and configuration by default. Treat a requested framework change as a separate
adapter over the same migrated test body. If the installed engine does not
support the requested source/target pair, preserve the framework and report
the conversion as manual work rather than guessing globals or assertions.

Emit direct, readable test declarations. Materialize selected parameterized
cases when necessary; do not introduce a runtime loop, hidden registry,
generated location shim, or generator warning.

## Preserve provenance and claims

Record the source repository, exact revision, and source path for every
migrated file. State the old case's behavioral claim before editing it. Keep
case-level comments only where they explain a real lifecycle, scheduler,
cancellation, or divergence decision.

Treat analyzer fingerprints as duplicate candidates, never automatic deletion.
Consolidate only when public API/overload, lifecycle, values, timing, completion,
errors, cancellation, subscription claim, and relevant type behavior all
match. Retain links to every original case in the manifest/report.

## Convert harness structure

Replace a supported `TestScheduler.run(...)` wrapper with one direct `rxTest`
call. Remove a scheduler variable, constructor, matcher adapter, or setup hook
only when it has no other responsibility. Return or await the `Promise<void>`
from `rxTest` through the outer test.

Preserve the meaning of supported helpers:

- `cold()` represents producer-per-subscription evidence;
- `hot()` represents a subject-like absolute timeline;
- `observable()` represents the shared, ref-counted platform producer;
- `expectObservable()` retains cancellation from the subscription marble;
- `expectSubscriptions()` describes observer subscriptions for cold sources
  and producer activation windows for platform sources;
- `time()` and `animate()` use the `@rxjs/test` virtual host boundary; and
- `flush()` is asynchronous and must be awaited from an `async` callback.

Refuse or manually classify direct scheduler state, methods used outside the
supported run callback, scheduler subclasses, implementation-only queue/frame
assertions, or unsupported framework assertions. Do not erase them as obsolete
without a reviewed evidence classification.

## Convert composition through the registry

For each RxJS 7 pipeable call, look up the exact installed capability entry and
apply only its declared Symbol target, argument adapter, arity, preconditions,
and fixture-proved source shape. Convert a supported sequence into successive
exact-Symbol calls and import those Symbols from the declared modules.

Do not copy a table of operator mappings into project guidance. Do not use a
platform string method because its description matches an RxJS 7 operator.
Preserve unsupported overloads and mixed pipelines with their diagnostics.

Use an ambient/global `Observable` when the accepted target contract requires
platform construction. Do not import the constructor from a polyfill merely to
make a test pass.

## Review lifecycle and realms

Keep a producer-per-subscription baseline visibly separate from platform
coverage. For the platform lifecycle, test first activation, concurrent join,
late observation, individual abort, final abort/teardown, and later restart as
applicable.

Run the same platform claim against fallback and native implementations where
the project supports both. Initialize each in an isolated process, worker,
window, or iframe before importing RxJS extensions and tests. If the realm has
no native `Observable`, record native mode as unavailable; never install the
fallback and label the result native.

Remove scheduler arguments only when the installed target capability and its
fixtures prove a host-timed mapping that `rxTest` virtualizes. Preserve original
error values and ordinary non-marble assertions. If product behavior fails a
faithful migrated claim, retain the evidence as a product gap rather than
changing production code or weakening the expectation.
