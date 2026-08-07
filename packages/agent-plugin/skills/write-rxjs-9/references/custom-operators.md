# Authoring custom operators in RxJS 9

There are two useful levels of customization:

1. an ordinary transformation function for application or library
   composition; and
2. a public exact Symbol extension when fluent Symbol invocation is itself the
   library API.

Prefer the first. It adds no prototype surface and reuses existing operators.

## Compose a reusable transformation

RxJS 9 does not require or export the RxJS 7 `OperatorFunction` contract. Type
the source-to-source function directly:

```ts
import { filter } from 'rxjs/filter';
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';

type Transformation<A, B> = (source: Observable<A>) => Observable<B>;

function validReadings(): Transformation<Reading, Reading> {
  return (source) => source[filter]((reading) => reading.valid);
}

function toDisplayReading(): Transformation<Reading, DisplayReading> {
  return (source) =>
    source[map]((reading) => ({
      label: reading.sensorName,
      value: `${reading.value.toFixed(1)} ${reading.unit}`,
    }));
}

const display = readings[pipe](validReadings(), toDisplayReading());
```

The exact `[pipe]` Symbol composes ordinary functions; it is not the RxJS 7
string `.pipe` or pipeable import surface.

## Publish an exact Symbol extension

Use a module-owned `Symbol()` for an external public operator. Do not use
`Symbol.for` unless the library has explicitly designed namespacing,
duplicate-installation, and compatibility semantics.

```ts
import { create } from 'rxjs/create';

export const mapDefined: unique symbol = Symbol('mapDefined');

declare global {
  interface Observable<T> {
    [mapDefined]<R>(project: (value: T, index: number) => R | undefined): Observable<R>;
  }
}

Observable.prototype[mapDefined] = function <T, R>(
  this: Observable<T>,
  project: (value: T, index: number) => R | undefined
): Observable<R> {
  return this[create]<R>((subscriber) => {
    let index = 0;

    try {
      this.subscribe(
        {
          next: (value) => {
            if (!subscriber.active) return;

            let projected: R | undefined;
            try {
              projected = project(value, index++);
            } catch (error) {
              subscriber.error(error);
              return;
            }

            if (projected !== undefined) subscriber.next(projected);
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    } catch (error) {
      subscriber.error(error);
    }
  });
};
```

Importing `rxjs/create` installs and types the public construction protocol.
Calling `this[create]` preserves the receiver's selected result lifecycle: a
platform receiver creates a platform result, while a `ColdObservable`
receiver creates a producer-per-direct-subscription result.

The user callback needs explicit `try`/`catch`. Its exception is an error in
the operator output, not an observer callback failure. Passing
`subscriber.signal` links source observation to output cancellation. Catching
the call to `subscribe` handles a synchronous setup failure from a source.

## Preserve the collision boundary

The exported exact Symbol is the public key. Do not install a string-named
method, derive identity from the description, or assume another
`Symbol('mapDefined')` is equivalent. Duplicate physical installations of an
external library naturally own different exact Symbols unless that library
deliberately specifies another protocol.

## Operator authoring checklist

- Prefer composition before low-level construction.
- Forward `error` and `complete` unless the documented operator transforms
  them.
- Catch user callback and conversion errors as output errors.
- Check `subscriber.active` around expensive or asynchronous work.
- Link every source and resource to `subscriber.signal` or `addTeardown()`.
- Define concurrency, ordering, buffering, cancellation, and terminal delay.
- Keep mutable state inside the initializer so it is per result activation,
  unless sharing across activations is explicitly the operator's API.
- Verify behavior for both platform and `ColdObservable` receivers if the
  operator claims to support both.
- Import only public subpaths; never depend on `src/` or internal helpers.

## Required tests

Test ordinary values, source error, source completion, owner abort, user
callback throw, synchronous source setup failure, downstream reentrancy,
per-activation state, exact-Symbol collision isolation, and receiver lifecycle
preservation. Add focused timing tests for concurrency, buffering, delayed
terminal behavior, or teardown order.

Hand the detailed harness to `write-rxjs-9-tests`.
