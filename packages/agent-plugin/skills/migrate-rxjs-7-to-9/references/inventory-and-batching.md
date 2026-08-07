# Inventory and batching

## Establish the baseline first

Run the repository's existing RxJS 7 build, types, lint, unit, integration,
browser, and framework tests that protect affected behavior. Record commands
and results before changing dependencies.

Add focused characterization tests when the suite does not prove:

- repeated and overlapping subscriptions;
- sharing, ref counting, replay, and late observers;
- cancellation and underlying resource release;
- source error, completion, and retry/repeat activation;
- higher-order ordering, dropping, buffering, and active-count bounds;
- synchronous emission and reentrancy;
- scheduler/host timing;
- Subject retained and terminal state; or
- custom input/source/operator protocol behavior.

## Inventory all RxJS boundaries

Search for:

- imports from `rxjs`, `rxjs/operators`, `rxjs/testing`, and deep/internal
  paths;
- `.pipe`, standalone `pipe`, and operator factories;
- every direct `subscribe`, stored `Subscription`, `unsubscribe`, and `add`;
- `firstValueFrom`, `lastValueFrom`, `forEach`, and async boundaries;
- `new Observable`, subclasses, `lift`, custom operator functions, and custom
  subscribables;
- Subjects, connectable/multicast code, `share`, and `shareReplay`;
- scheduler imports and operator/factory scheduler arguments;
- marble tests, TestScheduler setup, and subscription assertions;
- `Symbol.observable`, `@@observable`, foreign-realm values, and objects with
  `subscribe`;
- framework lifecycle adapters and public library types that expose RxJS 7.

Build migration units around behavior, then associate source files. This
prevents a mechanical file batch from hiding a cross-file shared lifetime.

## Choose MCP batches for reviewability

The hard limit is 25 files, 512 KiB per file, and 2 MiB total. Prefer much
smaller behavior-coherent batches:

- one feature or public API;
- tests beside the implementation they characterize;
- no unrelated refactors;
- no unresolved lifecycle mixed with accepted units; and
- enough context to understand aliases and imports within each file.

`analyze_migration` and `preview_migration` receive the exact same source text
that was inventoried. If source changes between analysis and application,
re-analyze rather than applying a stale candidate.

## Preserve atomic refusals

The engine deliberately refuses a mixed pipeline when only some operators are
proved. Do not extract and apply the safe-looking fragment by hand while
pretending the preview was accepted. Either migrate the full pipeline through
reviewed authoring rules or leave it unchanged until its behavior is resolved.
