[API](../../index.md) / [rxjs](../index.md) / NEVER

# Variable: NEVER

> An Observable that emits no items to the Observer and never completes.

## Description

![](/images/marble-diagrams/never.png)

A simple Observable that emits neither values nor errors nor the completion
notification. It can be used for testing purposes or for composing with other
Observables. Please note that by never emitting a complete notification, this
Observable keeps the subscription from being disposed automatically.
Subscriptions need to be manually disposed.

## Example

Emit the number 7, then never emit anything else (not even complete)

```ts
import { NEVER, startWith } from 'rxjs';

const info = () => console.log('Will not be called');

const result = NEVER.pipe(startWith(7));
result.subscribe({
  next: (x) => console.log(x),
  error: info,
  complete: info,
});
```

```ts
const NEVER: Observable<never>;
```

Defined in: [rxjs/src/internal/observable/never.ts:37](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/never.ts#L37)

## See

- [Observable](../classes/Observable.md)
- [EMPTY](EMPTY.md)
- [of](../functions/of.md)
- [throwError](../functions/throwError.md)
