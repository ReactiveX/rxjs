# RxJS Core Semantics

Starting in version 8, all RxJS operators that are provided in the core library MUST meet the following semantics. In the current version, version 7, all operators SHOULD meet the following semantics (as guidelines). If they do not, we need to track the issue on [GitHub](https://github.com/ReactiveX/rxjs/issues).

## Purpose

The purpose of these semantics is provide predictable behavior for the users of our library, and to ensure consistent behavior between our many different operators. It should be noted that at the time of this writing, we don't always adhere to these semantic guidelines. This document is to serve as a goalpost for upcoming changes and work as much as it is to help describe the library. This is also a "living document" and is subject to change.

## General Design Guidelines

**Functions such as operators, constructors, and creation functions, should use named parameters in cases where there is more than 1 argument, and arguments after the first are non-obvious.** The primary use case should be streamlined to work without configuration. For example, `fakeFlattenMap(n => of(n))` is fine, but `fakeFlattenMap(n => of(n), 1)` is less readable than `fakeFlattenMap(n => of(n), { maxConcurrent: 1 })`. Other things, like `of(1, 2, 3)` are obvious enough that named parameters don't make sense.

## Operators

- MUST be a function that returns an [operator function](https://rxjs.dev/api/index/interface/OperatorFunction). That is `(source: Observable<In>) => Observable<Out>`.
- The returned operator function MUST be [referentially transparent](https://en.wikipedia.org/wiki/Referential_transparency). That is to say, that if you capture the return value of the operator (e.g. `const double => map(x => x + x)`), you can use that value to operate on any many observables as you like without changing any underlying state in the operator reference. (e.g. `a$.pipe(double)` and `b$.pipe(double)`).
- The observable returned by the operator function MUST subscribe to the source.
- If the operation performed by the operator can tell it not change anything about the output of the source, it MUST return the reference to the source. For example `take(Infinity)` or `skip(0)`.
- Operators that accept a "notifier", that is another observable source that is used to trigger some behavior, must accept any type that can be converted to an `Observable` with `from`. For example `takeUntil`.
- Operators that accept "notifiers" (as described above), MUST ONLY recognized next values from the notifier as "notifications". Emitted completions may not be used a source of notification.
- "Notifiers" provided directly to the operator MUST be subscribed to _before_ the source is subscribed to. "Notifiers" created via factory function provided to the operator SHOULD be subscribed to at the earliest possible moment.
- The observable returned by the operator function is considered to be the "consumer" of the source. As such, the consumer MUST unsubscribe from the source as soon as it knows it no longer needs values before proceeding to do _any_ action.
- Events that happen after the completion of a source SHOULD happen after the source finalizes. This is to ensure that finalization always happens in a predictable time frame relative to the event.
- `Error` objects MUST NOT be retained longer than necessary. This is a possible source of memory pressure.
- `Promise` references MUST NOT be retained longer than necessary. This is a possible source of memory pressure.
- IF they perform a related operation to a creation function, they SHOULD share the creation function's name only with the suffix `With`. (e.g. `concat` and `concatWith`).
- SHOULD NOT have "result selectors". This is a secondary argument that provides the ability to "map" values after performing the primary operation of the operator.

## Creation Functions

- Names MUST NOT end in `With`. That is reserved for the operator counter parts of creation functions.
- MAY have "result selectors". This is a secondary argument that provides the ability to "map" values before they're emitted from the resulting observable.
- IF the creation function accepts a "result selector", it must not accept "n-arguments" ahead of that result selector. Instead, it should accept an array or possibly an object. (bad: `combineThings(sourceA$, sourceB$, (a, b) => a + b)`, good: `combineThings([sourceA$, sourceB$], (a, b) => a + b)`. In this case, it may be okay to provide the result selector as a second argument, rather than as a named parameter, as the use should be fairly obvious.
