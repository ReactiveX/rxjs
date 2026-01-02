[API](../../index.md) / [rxjs](../index.md) / audit

# Function: audit()

```ts
function audit<>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/audit.ts:50](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/audit.ts#L50)

Ignores source values for a duration determined by another Observable, then
emits the most recent value from the source Observable, then repeats this
process.

<span class="informal">It's like [auditTime](auditTime.md), but the silencing
duration is determined by a second Observable.</span>

<div><img class="only-light" src="/images/marble-diagrams/audit-light.svg" alt="Marble diagram" />
<img class="only-dark" src="/images/marble-diagrams/audit-dark.svg" alt="Marble diagram" /></div>

`audit` is similar to `throttle`, but emits the last value from the silenced
time window, instead of the first value. `audit` emits the most recent value
from the source Observable on the output Observable as soon as its internal
timer becomes disabled, and ignores source values while the timer is enabled.
Initially, the timer is disabled. As soon as the first source value arrives,
the timer is enabled by calling the `durationSelector` function with the
source value, which returns the "duration" Observable. When the duration
Observable emits a value, the timer is disabled, then the most
recent source value is emitted on the output Observable, and this process
repeats for the next source value.

## Parameters

| Parameter          | Type                                                                               | Description                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `durationSelector` | (`value`: `T`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that receives a value from the source Observable, for computing the silencing duration, returned as an Observable or a Promise. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that performs rate-limiting of
emissions from the source Observable.

## Example

Emit clicks at a rate of at most one click per second

```ts
import { fromEvent, audit, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(audit((ev) => interval(1000)));
result.subscribe((x) => console.log(x));
```

## See

- [auditTime](auditTime.md)
- [debounce](debounce.md)
- [delayWhen](delayWhen.md)
- [sample](sample.md)
- [throttle](throttle.md)
