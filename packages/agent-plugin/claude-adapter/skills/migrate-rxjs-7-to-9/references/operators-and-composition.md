# Operators and composition

## Mechanical registry boundary

Call `migration_capabilities` for the versioned mapping ids, source name,
target Symbol/module, argument adapter, supported arity, preconditions,
evidence classification, and review notes. The generated capability reference
is a human-readable mirror checked against the runtime registry.

The engine handles only direct `.pipe(...)` calls whose entries are direct,
unshadowed imported operator calls and whose whole pipeline is supported. It
refuses aliases/references it cannot remove safely, mixed unsupported entries,
unsupported overloads, scheduler arguments, and malformed input.

Do not copy a capability list into handwritten instructions. The registry and
generated reference are the mutable authority.

## Exact Symbol target

```ts
// RxJS 7
import { filter, map } from 'rxjs/operators';
const names = users.pipe(
  filter((user) => user.active),
  map((user) => user.name)
);

// RxJS 9
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';
const names = users[filter]((user) => user.active)[map]((user) => user.name);
```

`users.map(...)` is the platform string method, not an interchangeable spelling
of `users[map](...)`.

## Unified capabilities need readable review

Some RxJS 7 names map to a more general RxJS 9 capability with explicit
options. Review the generated arguments as domain policy. For example,
queueing is expressed through `[mergeMap](project, { concurrent: 1 })`, not a
separate pipeable `concatMap` contract.

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
source[map]((value, index) => project.call(context, value, index));
```

The MCP refuses this overload; it must not drop the second argument silently.
Likewise, result selectors and scheduler overloads require reviewed source
changes.

## Manual pipelines

When a pipeline is outside the registry:

1. preserve the RxJS 7 source until its behavior is characterized;
2. find the public RxJS 9 capability and read its actual signature/tests;
3. choose receiver lifecycle and input adapters;
4. write exact Symbol composition using `write-rxjs-9` guidance;
5. compare notification, cancellation, error, completion, and timing behavior;
6. document intentional differences; and
7. add it to the engine only with deterministic fixtures and evidence.

Absence from the mechanical registry does not mean RxJS 9 lacks a public API;
it means the engine has not proved that rewrite.
