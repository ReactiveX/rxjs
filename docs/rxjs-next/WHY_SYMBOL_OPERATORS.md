# Why RxJS is moving to Symbol operators

The short version: RxJS operators are becoming methods addressed by imported
Symbols.

```ts
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';

const result = source[filter]((value) => value.active)[map]((value) => value.name);
```

This is mostly a change in spelling. Operators still take an Observable,
produce an Observable, and compose from left to right. The new form simply fits
RxJS onto the web-platform `Observable` without claiming ordinary method names
that belong to the platform.

## A safer version of an old idea

RxJS has used importable operator modules before. In RxJS 5.0, an application
could install only the operators it needed:

```ts
import 'rxjs/add/operator/map';

const result = source.map(project);
```

That design and the new Symbol design are both tree-shakable at the operator
module level. The problem with the RxJS 5.0 approach was not modularity. It was
unsafe mutation.

The old module wrote to a string-named property such as
`Observable.prototype.map`. Every library and every version shared that same
namespace. If two packages installed different implementations under `map`,
one could trample the other, and import order decided which implementation
survived.

Exact Symbols change that.

```ts
const first = Symbol('map');
const second = Symbol('map');

first === second; // false
```

The description is only a label. Code must hold the exact exported Symbol to
address its property. An unrelated package can install its own `map` Symbol
without overwriting RxJS, and RxJS can add operators without overwriting the
platform's string-named methods.

That makes the mutation narrow and predictable: importing an RxJS operator
authorizes one implementation in one exact Symbol slot. We keep the
tree-shakable, operator-at-a-time installation model from RxJS 5.0 while making
the mutation safe from accidental trampling.

It is not a security boundary, but unrelated code cannot collide merely by
choosing the same operator name.

It also lets the platform and RxJS offer different contracts under familiar
names without conflict:

```ts
source.map(project); // Web-platform contract
source[map](project); // RxJS contract
```

Neither form has to replace or distort the other.

## Composition is more direct

Pipeable operators compose functions around a source:

```ts
const result = source.pipe(
  filter((value) => value.active),
  map((value) => value.name)
);
```

Symbol operators compose directly from the value:

```ts
const result = source[filter]((value) => value.active)[map]((value) => value.name);
```

The data flow is the same. The direct form removes the extra operator-function
layer from everyday reading: the receiver is visibly the Observable being
transformed, and each call returns the next Observable in the chain.

Symbols also give the complete RxJS operator catalog one consistent style.
Operators that overlap with the platform, such as `map` and `filter`, use the
same RxJS syntax as operators that exist only in RxJS.

## Future-proofing composition

Pipeable operators also pointed toward a JavaScript future we hoped would
include a standard pipeline operator:

```ts
const result = source
  |> filter((value) => value.active)
  |> map((value) => value.name);
```

That language feature did not arrive in a form or timeline RxJS could build
around. The [TC39 pipeline operator proposal][tc39-pipe] remains at Stage 2,
and RxJS should not keep its primary operator design coupled to syntax that may
still change or never ship.

Symbol operators use JavaScript that exists today. They compose naturally on
the platform Observable, do not depend on new syntax, and do not prevent RxJS
from taking advantage of a future pipeline operator if one eventually becomes
standard. That makes this a future-proof move rather than another bet on one
proposed syntax.

## `pipe` is still available

Function composition remains useful, especially for reusable transformations
and incremental migration. RxJS therefore provides a Symbol-addressed `pipe`:

```ts
import { pipe } from 'rxjs/pipe';

const double = (source) => source[map]((value) => value * 2);
const positive = (source) => source[filter]((value) => value > 0);

const result = source[pipe](double, positive);
```

The compatibility layer can use this composition point to preserve familiar
RxJS 7-style pipeable operator functions and types. Existing applications do
not need to rewrite every pipeline at once, and libraries can continue to pass
reusable operator functions across an API boundary.

## This is not a new mental model

The important parts of RxJS do not change:

- an operator derives one Observable from another;
- operators compose in order;
- pipelines remain readable and reusable;
- operator behavior remains backed by the RxJS test corpus;
- a compatibility path remains available for pipeable code.

The visible migration is usually mechanical: import the operator's Symbol and
invoke it on the source. In return, RxJS gets collision-safe extension,
coexists cleanly with the web platform, and gains one uniform operator syntax.

It is a meaningful architectural improvement, but for day-to-day RxJS code,
it is no big deal.

[tc39-pipe]: https://github.com/tc39/proposals#stage-2
