[API](../../index.md) / [index](../index.md) / materialize

# Function: materialize()

```ts
function materialize<>(): OperatorFunction<T, Notification<T> & ObservableNotification<T>>;
```

Defined in: [internal/operators/materialize.ts:54](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/materialize.ts#L54)

Represents all of the notifications from the source Observable as `next`
emissions marked with their original types within [Notification](../classes/Notification.md)
objects.

<span class="informal">Wraps `next`, `error` and `complete` emissions in
[Notification](../classes/Notification.md) objects, emitted as `next` on the output Observable.
</span>

![](materialize.png)

`materialize` returns an Observable that emits a `next` notification for each
`next`, `error`, or `complete` emission of the source Observable. When the
source Observable emits `complete`, the output Observable will emit `next` as
a Notification of type "complete", and then it will emit `complete` as well.
When the source Observable emits `error`, the output will emit `next` as a
Notification of type "error", and then `complete`.

This operator is useful for producing metadata of the source Observable, to
be consumed as `next` emissions. Use it in conjunction with
[dematerialize](dematerialize.md).

## Example

Convert a faulty Observable to an Observable of Notifications

```ts
import { of, materialize, map } from 'rxjs';

const letters = of('a', 'b', 13, 'd');
const upperCase = letters.pipe(map((x: any) => x.toUpperCase()));
const materialized = upperCase.pipe(materialize());

materialized.subscribe(x => console.log(x));

// Results in the following:
// - Notification { kind: 'N', value: 'A', error: undefined, hasValue: true }
// - Notification { kind: 'N', value: 'B', error: undefined, hasValue: true }
// - Notification { kind: 'E', value: undefined, error: TypeError { message: x.toUpperCase is not a function }, hasValue: false }
```

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`Notification`](../classes/Notification.md)\<`T`\> & [`ObservableNotification`](../type-aliases/ObservableNotification.md)\<`T`\>\>

A function that returns an Observable that emits
[Notification](../classes/Notification.md) objects that wrap the original emissions from the
source Observable with metadata.

## See

 - [Notification](../classes/Notification.md)
 - [dematerialize](dematerialize.md)
