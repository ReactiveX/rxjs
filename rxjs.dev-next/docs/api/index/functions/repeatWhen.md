[API](../../index.md) / [index](../index.md) / repeatWhen

# ~~Function: repeatWhen()~~

```ts
function repeatWhen<>(notifier: (notifications: Observable<void>) => ObservableInput<any>): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/repeatWhen.ts:44](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/repeatWhen.ts#L44)

Returns an Observable that mirrors the source Observable with the exception of a `complete`. If the source
Observable calls `complete`, this method will emit to the Observable returned from `notifier`. If that Observable
calls `complete` or `error`, then this method will call `complete` or `error` on the child subscription. Otherwise
this method will resubscribe to the source Observable.

![](repeatWhen.png)

## Example

Repeat a message stream on click

```ts
import { of, fromEvent, repeatWhen } from 'rxjs';

const source = of('Repeat message');
const documentClick$ = fromEvent(document, 'click');

const result = source.pipe(repeatWhen(() => documentClick$));

result.subscribe(data => console.log(data))
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `notifier` | (`notifications`: [`Observable`](../classes/Observable.md)\<`void`\>) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | Function that receives an Observable of notifications with which a user can `complete` or `error`, aborting the repetition. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that mirrors the source
Observable with the exception of a `complete`.

## See

 - [repeat](repeat.md)
 - [retry](retry.md)
 - [retryWhen](retryWhen.md)

## Deprecated

Will be removed in v9 or v10. Use [repeat](repeat.md)'s [delay](../interfaces/RepeatConfig.md#delay) option instead.
Instead of `repeatWhen(() => notify$)`, use: `repeat({ delay: () => notify$ })`.
