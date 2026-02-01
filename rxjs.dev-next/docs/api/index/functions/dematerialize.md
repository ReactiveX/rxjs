[API](../../index.md) / [index](../index.md) / dematerialize

# Function: dematerialize()

```ts
function dematerialize<>(): OperatorFunction<N, ValueFromNotification<N>>;
```

Defined in: [internal/operators/dematerialize.ts:54](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/dematerialize.ts#L54)

Converts an Observable of [ObservableNotification](../type-aliases/ObservableNotification.md) objects into the emissions
that they represent.

<span class="informal">Unwraps [ObservableNotification](../type-aliases/ObservableNotification.md) objects as actual `next`,
`error` and `complete` emissions. The opposite of [materialize](materialize.md).</span>

![](dematerialize.png)

`dematerialize` is assumed to operate an Observable that only emits
[ObservableNotification](../type-aliases/ObservableNotification.md) objects as `next` emissions, and does not emit any
`error`. Such Observable is the output of a `materialize` operation. Those
notifications are then unwrapped using the metadata they contain, and emitted
as `next`, `error`, and `complete` on the output Observable.

Use this operator in conjunction with [materialize](materialize.md).

## Example

Convert an Observable of Notifications to an actual Observable

```ts
import { NextNotification, ErrorNotification, of, dematerialize } from 'rxjs';

const notifA: NextNotification<string> = { kind: 'N', value: 'A' };
const notifB: NextNotification<string> = { kind: 'N', value: 'B' };
const notifE: ErrorNotification = { kind: 'E', error: new TypeError('x.toUpperCase is not a function') };

const materialized = of(notifA, notifB, notifE);

const upperCase = materialized.pipe(dematerialize());
upperCase.subscribe({
  next: x => console.log(x),
  error: e => console.error(e)
});

// Results in:
// A
// B
// TypeError: x.toUpperCase is not a function
```

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`N`, [`ValueFromNotification`](../type-aliases/ValueFromNotification.md)\<`N`\>\>

A function that returns an Observable that emits items and
notifications embedded in Notification objects emitted by the source
Observable.

## See

[materialize](materialize.md)
