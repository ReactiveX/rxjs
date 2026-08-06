# All-pipeable beta experiment

This branch evaluates an all-pipeable RxJS 9 surface alongside the existing
exact-Symbol surface. It is deliberately small: the first review slice contains
`rx`, pipeable `map` and `filter`, the public composition types, and an internal
`operate` helper. After the first maintainer review, a second small slice adds
pipeable `take`, Observable-returning `toArray`, and the optional lite
`subscribe` terminal. The rest of the catalog and final Symbol import move
remain gated on maintainer review.

The experiment does not change the platform foundation. `rx` converts its
first argument with the active realm's `Observable.from`; pipeable operators
construct through the receiver's RxJS creation protocol; source work remains
owned by the result Subscriber's `AbortSignal`.

## Pipeable form

```ts
import { filter, map, rx } from 'rxjs';

const result = rx(
  [1, 2, 3, 4],
  filter((value) => value % 2 === 0),
  map((value, index) => `${index}: ${value * 10}`)
);

result.subscribe(console.log); // '0: 20', '1: 40'
```

`rx` is not restricted to Observable-returning functions. The first function
receives the converted `Observable<T>` and each later function receives the
preceding result. The final return type is therefore the final function's
return type.

## Existing Symbol form

```ts
import 'rxjs';
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';

const source = Observable.from([1, 2, 3, 4]);
const result = source[filter]((value) => value % 2 === 0)[map]((value, index) => `${index}: ${value * 10}`);

result.subscribe(console.log); // '0: 20', '1: 40'
```

The current deep imports still export Symbols. The proposed eventual shape is
for ordinary deep imports to export pipeable functions and for exact Symbols
to move under a clearly separate `rxjs/symbol` boundary. This pilot does not
perform that move because it would answer package-layout and barrel-versus-
per-operator questions before the implementation pattern is reviewed.

## Platform method form

```ts
import 'rxjs';

const result = Observable.from([1, 2, 3, 4])
  .filter((value) => value % 2 === 0)
  .map((value) => value * 10);

result.subscribe(console.log); // 20, 40
```

This form is concise for methods the platform defines, but it cannot represent
the complete RxJS catalog. Platform terminal consumers such as `first`,
`last`, `reduce`, and `toArray` return Promises; RxJS pipeable counterparts use
separate Observable-returning contracts.

## Critical comparison

| Concern              | `rx` plus pipeable functions                                                                                       | Exact Symbol chaining                                                                                | Platform methods                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Visual flow          | Reads left-to-right as a list of transformations and keeps punctuation light                                       | Reads left-to-right on the value, but bracket access is unfamiliar and visually dense                | Familiar method chaining with the least import ceremony                          |
| Catalog uniformity   | One syntax can cover every RxJS operator, factory adapter, and terminal Observable                                 | One syntax can cover the full RxJS catalog without taking string names                               | Limited to the standardized platform catalog                                     |
| Type inference       | Strong within the declared overload horizon; depends on contextual typing across one overloaded call               | Each receiver call is inferred independently with no chain-length horizon                            | Each receiver call is inferred independently                                     |
| Long chains          | This pilot preserves nine transformations and returns `unknown` beyond that point                                  | No fixed composition overload limit                                                                  | No fixed composition overload limit                                              |
| Type-error locality  | An incompatibility can be reported at an overload boundary or later argument instead of exactly at the bad handoff | Usually points at the exact Symbol call whose receiver type is incompatible                          | Usually points at the exact method call                                          |
| TypeScript work      | More overloads increase declaration size and overload-resolution work at every call site                           | Work grows one ordinary call at a time                                                               | Work grows one ordinary call at a time                                           |
| Runtime mutation     | Pipeable functions do not install operator properties                                                              | Importing a capability patches its exact Symbol onto the active constructor or prototype             | Owned by the native implementation or fallback                                   |
| Collision behavior   | Ordinary lexical imports; no global property collision                                                             | Exact module-owned Symbols isolate unrelated libraries and package copies                            | String names belong to the platform contract                                     |
| Tree shaking         | A function import can be removed when unused if the module remains side-effect-free                                | Capability imports are side effects and must be retained even when the Symbol binding appears unused | No RxJS operator module is needed                                                |
| Native overlap       | RxJS owns a distinct function contract even when the platform has the same familiar name                           | The distinct exact key makes the boundary explicit at the call site                                  | Always selects the platform contract                                             |
| Agent-generated code | Common JavaScript functional-composition syntax is easy to synthesize and refactor                                 | Exact keys are unambiguous but require less familiar syntax                                          | Familiar, but agents must know which names return Promises or lack RxJS behavior |

Readability is subjective, but the tradeoffs are not. Pipeable syntax removes
the brackets users objected to and matches existing RxJS experience. Symbol
syntax has better unbounded chain inference, more local diagnostics, explicit
contract selection at native-overlap names, and exact-key collision isolation.
Platform methods have the best familiarity but cannot carry the complete RxJS
contract.

## Observable-returning terminal form

The platform `source.toArray()` contract returns a Promise. The RxJS
`toArray()` function intentionally emits one array as an Observable value:

```ts
import { rx, toArray } from 'rxjs';

const result = rx([1, 2, 3], toArray());
result.subscribe(console.log); // [1, 2, 3]
```

This keeps cancellation, sharing, error forwarding, and later Observable
composition inside the same graph. It does not wrap the platform Promise; it
collects source values through `operate` and emits only on completion.

## Lite subscription terminal

```ts
import { rx, subscribe } from 'rxjs';

const subscription = rx(source, subscribe(console.log));
subscription.unsubscribe();
console.log(subscription.closed); // true
```

The returned `Subscription` is intentionally only an interface with
`unsubscribe()` and a live `closed` getter over one backing AbortSignal. Normal
completion and source error abort that signal too. This does not restore the
RxJS 7 class, child teardowns, `add`, `remove`, or aggregate unsubscription
errors.

## Provisional deep imports

New names without collisions use `rxjs/rx`, `rxjs/to-array`, and
`rxjs/subscribe`. While `rxjs/map`, `rxjs/filter`, and `rxjs/take` retain their
exact Symbols, the pilot functions are available at `rxjs/pipeable/map`,
`rxjs/pipeable/filter`, and `rxjs/pipeable/take`. Additive aliases at
`rxjs/symbol/map`, `rxjs/symbol/filter`, and `rxjs/symbol/take` exercise the
per-operator Symbol direction without moving or removing the established
subpaths. These aliases are evidence for the final layout, not a decision that
the complete catalog must use this exact arrangement.

## TypeScript limits and checking cost

`rx` has explicit overloads for one through nine transformations. At each
position, the output type of one function becomes the input type of the next.
This gives good contextual inference for ordinary operator calls, including
type-guard and `Boolean` narrowing in `filter`.

A tenth transformation is accepted by a fallback overload whose result is
`unknown`. This is an intentional safety boundary: returning `any` would hide
errors, while claiming a precise type would be false. Users can preserve types
by splitting a large pipeline into named functions or by assigning a segment
an explicit `OperatorFunction<T, R>`.

Two alternatives are possible, and neither is free:

- Adding more fixed overloads extends the horizon but enlarges declarations
  and gives TypeScript more candidates to evaluate at every `rx` call.
- A recursive variadic-tuple type can model longer heterogeneous chains, but it
  tends to increase instantiation depth, checking time, and diagnostic
  complexity. It must be benchmarked on representative Angular and TypeScript
  projects before becoming a public contract.

Overloaded operators can also lose contextual information when stored in an
unannotated variable before composition. An explicit `OperatorFunction` or
callback parameter type restores that information. Symbol and platform method
calls start from a concrete receiver type, so they are less exposed to that
particular failure mode.

## Initial implementation pattern

Pipeable operators are built with internal `operate(init)`. It returns an
`OperatorFunction<T, R>` that creates its result through the source's versioned
RxJS construction protocol. The `init(source, subscriber)` body is wrapped in
`try/catch`, so synchronous connection failures become stream errors.

Operators subscribe through the existing safe source helper. That helper owns
the result signal, guards notification overrides, forwards source terminal
events, and turns projector or predicate throws into `subscriber.error`.
Together these two boundaries cover setup-time and notification-time failures
without duplicating boilerplate in every operator.

`mapOperator(project)` is the first shared implementation callback. Both the
pipeable `map(project)` function and the exact-Symbol `[map](project)` method
pass that callback through `operate`, so the two public forms share lifecycle,
index, cancellation, and callback-error behavior without making either form
delegate through the other's public API.

## First maintainer review

The first review approved continued work with four API corrections:

- the ambient platform conversion union is named `ObservableInput` directly;
  the temporary alias over `ObservableValue` is gone;
- `UnaryFunction<In, Out>` is a function type alias;
- `OperatorFunction<In, Out>` directly spells
  `(source: Observable<In>) => Observable<Out>`;
- the redundant `MonoTypeOperatorFunction` alias is not part of RxJS Next.

The review also selected shared internal operator callbacks for implementations
used by both the pipeable and exact-Symbol forms, beginning with `mapOperator`.
This resolves the implementation-sharing question for the next pilot slice;
it does not yet settle the package-path move for the complete catalog.

## Review gates before expanding the catalog

The pilot intentionally leaves these decisions open:

1. Whether pipeable deep imports should be `rxjs/map` and Symbols should be a
   `rxjs/symbol` barrel, per-operator `rxjs/symbol/map` paths, or both.
2. Whether nine transformations is the right overload horizon and which
   representative projects should supply type-check performance evidence.
3. Whether `operate` remains internal or becomes an advanced public API.
4. Whether the Observable-returning `toArray` and live AbortSignal-backed lite
   `subscribe` contracts should become accepted public APIs after the pilot.

The first implementation has now been reviewed. The next slice may add only a
small representative set covering an ordinary operator, an
Observable-returning terminal consumer, and the optional lite subscription
facade before returning for another review.
