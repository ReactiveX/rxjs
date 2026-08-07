# Operators and composition

## Mechanical registry boundary

Call `migration_capabilities` for two related surfaces:

- the complete RxJS 7 public catalog, where every operator, function, value,
  type, specialty package, scheduler concern, interop boundary, and deprecated
  alias has a migration disposition; and
- the much smaller deterministic registry, whose mappings have exact fixture,
  arity, precondition, diagnostic, type, behavior, and idempotence evidence.

The engine handles only direct `.pipe(...)` calls whose entries are direct,
unshadowed imported operator calls and whose whole pipeline is supported. It
refuses aliases/references it cannot remove safely, mixed unsupported entries,
unsupported overloads, scheduler arguments, and malformed input.

Do not copy a capability list into handwritten instructions. The registry and
generated reference are the mutable authority.

## Cold-preserving target, then platform optimization

```ts
// RxJS 7
import { filter, map } from 'rxjs/operators';
const names = users.pipe(
  filter((user) => user.active),
  map((user) => user.name)
);

// RxJS 9 default: preserve ColdObservable construction.
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';

const names = users[filter]((user) => user.active)[map]((user) => user.name);

// After the unit is explicitly promoted to the platform lifecycle:
const platformNames = users.filter((user) => user.active).map((user) => user.name);
```

The platform form avoids extension imports and browser bundle bytes, but a
native string method on `ColdObservable` deliberately crosses its result to the
platform lifecycle. Use it only after platform promotion. In platform mode,
proved mappings prefer `.map()`, `.filter()`, sequential `.flatMap()`, and
`.switchMap()` where applicable. In cold mode, the same registry emits exact
Symbols. `[takeUntil]` remains exact in either mode because platform
`.takeUntil()` handles notifier errors differently.

## Unified capabilities need readable review

Some RxJS 7 names map to a more general RxJS 9 capability with explicit
options. Review the generated arguments as domain policy. For example,
queueing can be expressed through platform `.flatMap(project)` for platform
lifecycle or `[mergeMap](project, { concurrent: 1 })` when exact receiver
construction must be preserved. Sequential queueing is the safe default;
`[mergeMap]` with higher concurrency is an explicit parallelization decision.

Do not simplify generated options merely because defaults currently match.
Their presence may preserve a specific RxJS 7 behavior or document an
intentional divergence.

## Removed overloads

RxJS 9 does not accept RxJS 7 callback `thisArg` parameters. Close over state or
bind explicitly after characterization:

```ts
// RxJS 7
source.pipe(map(project, context));

// RxJS 9
source.map((value, index) => project.call(context, value, index));
```

The MCP refuses this overload; it must not drop the second argument silently.
Likewise, result selectors and scheduler overloads require reviewed source
changes.

## Manual pipelines

When a pipeline is outside the registry:

1. preserve the RxJS 7 source until its behavior is characterized;
2. find the public RxJS 9 capability and read its actual signature/tests;
3. choose receiver lifecycle and input adapters;
4. retain exact Symbol composition for the cold default; after an explicit
   platform promotion, prefer platform methods where the catalog records a
   semantic candidate, following `write-rxjs-9` guidance;
5. compare notification, cancellation, error, completion, and timing behavior;
6. document intentional differences; and
7. add it to the engine only with deterministic fixtures and evidence.

Absence from the mechanical registry does not mean RxJS 9 lacks a public API;
it means the engine has not proved that rewrite.
