# RxJS Core Semantics

Starting in version 8, all RxJS operators that are provided in the core library MUST meet the following semantics. In the current version, version 7, all operators SHOULD meet the following semantics (as guidelines). If they do not, we need to track the issue on [GitHub](https://github.com/ReactiveX/rxjs/issues).

## Purpose

The purpose of these semantics is provide predictable behavior for the users of our library, and to ensure consistent behavior between our many different operators.

## Operators

    - MUST be a function that returns an [operator function](https://rxjs.dev/api/index/interface/OperatorFunction). That is `(source: Observable<In>) => Observable<Out>`.
    - The observable returned by the operator function MUST subscribe to the source.
    - If the operation performed by the operator can tell it not change anything about the output of the source, it MUST return the reference to the source. For example `take(Infinity)` or `skip(0)`.
    - Operators that accept a "notifier", that is another observable source that is used to trigger some behavior, must accept any type that can be converted to an `Observable` with `from`. For example `takeUntil`.
    - "Notifiers" that are provided to operators are expected to emit a value in order to trigger notification. Completion does not count as a notification.
    - "Notifiers" provided directly to the operator MUST be subscribed to *before* the source is subscribed to. "Notifiers" created via factory function provided to the operator SHOULD be subscribed to at the earliest possible moment.
    - The observable returned by the operator function is considered to be the "consumer" of the source. As such, the consumer MUST unsubscribe from the source as soon as it knows it no longer needs values before proceeding to do _any_ action.
    - Events that happen after the completion of a source should happen after the source finalizes. This is to ensure that finalization always happens in a predictable time frame relative to the event.
    - `Error` objects should never be retained longer than necessary. This is a possible source of memory pressure.
    - `Promise` references should never be retained longer than necessary. This is a possible source of memory pressure.
    - Operators that split an source `Observable<T>` into many child observables `Observable<Observable<T>>` should emit child observables that do not stop simply because the original consumer subscription is unsubscribed. This is because those child observables may be consumed outside of that subscription life cycle. For example, a user could capture a grouped (child) observable emitted from `groupBy` and subscribe to it elsewhere. The purpose of the `groupBy` was to create observables, not dictate their lifespan.

# Creation Functions

TBD.
