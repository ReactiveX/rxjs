[API](../../index.md) / [index](../index.md) / TapObserver

# Interface: TapObserver

> An extension to the [Observer](Observer.md) interface used only by the [tap](../functions/tap.md) operator.

## Description

It provides a useful set of callbacks a user can register to do side-effects in
cases other than what the usual [Observer](Observer.md) callbacks are
(guide/glossary-and-semantics#next next,
guide/glossary-and-semantics#error error and/or
guide/glossary-and-semantics#complete complete).

## Example

```ts
import { fromEvent, switchMap, tap, interval, take } from 'rxjs';

const source$ = fromEvent(document, 'click');
const result$ = source$.pipe(
  switchMap((_, i) => i % 2 === 0
    ? fromEvent(document, 'mousemove').pipe(
        tap({
          subscribe: () => console.log('Subscribed to the mouse move events after click #' + i),
          unsubscribe: () => console.log('Mouse move events #' + i + ' unsubscribed'),
          finalize: () => console.log('Mouse move events #' + i + ' finalized')
        })
      )
    : interval(1_000).pipe(
        take(5),
        tap({
          subscribe: () => console.log('Subscribed to the 1-second interval events after click #' + i),
          unsubscribe: () => console.log('1-second interval events #' + i + ' unsubscribed'),
          finalize: () => console.log('1-second interval events #' + i + ' finalized')
        })
      )
  )
);

const subscription = result$.subscribe({
  next: console.log
});

setTimeout(() => {
  console.log('Unsubscribe after 60 seconds');
  subscription.unsubscribe();
}, 60_000);
```

Defined in: [internal/operators/tap.ts:52](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/tap.ts#L52)

## Extends

- [`Observer`](Observer.md)\<`T`\>

## Properties

| Property | Type | Description | Inherited from |
| ------ | ------ | ------ | ------ |
| <a id="complete"></a> `complete` | () => `void` | A callback function that gets called by the producer if and when it has no more values to provide (by calling `next` callback function). This means that no error has happened. This callback can't be called more than one time, it can't be called if the `error` callback function have been called previously, nor it can't be called if the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#complete this guide. | [`Observer`](Observer.md).[`complete`](Observer.md#complete) |
| <a id="error"></a> `error` | (`err`: `any`) => `void` | A callback function that gets called by the producer if and when it encountered a problem of any kind. The errored value will be provided through the `err` parameter. This callback can't be called more than one time, it can't be called if the `complete` callback function have been called previously, nor it can't be called if the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#error this guide. | [`Observer`](Observer.md).[`error`](Observer.md#error) |
| <a id="finalize"></a> `finalize` | () => `void` | The callback that `tap` operator invokes when any kind of guide/glossary-and-semantics#finalization finalization happens - either when the source Observable `error`s or `complete`s or when it gets explicitly unsubscribed by the user. There is no difference in using this callback or the [finalize](#finalize) operator, but if you're already using `tap` operator, you can use this callback instead. You'd get the same result in either case. | - |
| <a id="next"></a> `next` | (`value`: `T`) => `void` | A callback function that gets called by the producer during the subscription when the producer "has" the `value`. It won't be called if `error` or `complete` callback functions have been called, nor after the consumer has unsubscribed. For more info, please refer to guide/glossary-and-semantics#next this guide. | [`Observer`](Observer.md).[`next`](Observer.md#next) |
| <a id="subscribe"></a> `subscribe` | () => `void` | The callback that `tap` operator invokes at the moment when the source Observable gets subscribed to. | - |
| <a id="unsubscribe"></a> `unsubscribe` | () => `void` | The callback that `tap` operator invokes when an explicit guide/glossary-and-semantics#unsubscription unsubscribe happens. It won't get invoked on `error` or `complete` events. | - |
