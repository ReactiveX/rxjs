[API](../../index.md) / [rxjs](../index.md) / throwIfEmpty

# Function: throwIfEmpty()

```ts
function throwIfEmpty<>(errorFactory: () => any): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/throwIfEmpty.ts:41](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/throwIfEmpty.ts#L41)

If the source observable completes without emitting a value, it will emit
an error. The error will be created at that time by the optional
`errorFactory` argument, otherwise, the error will be [EmptyError](../classes/EmptyError.md).

![](/images/marble-diagrams/throwIfEmpty.png)

## Parameters

| Parameter      | Type        | Default value         | Description                                                                                                                |
| -------------- | ----------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `errorFactory` | () => `any` | `defaultErrorFactory` | A factory function called to produce the error to be thrown when the source observable completes without emitting a value. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that throws an error if the
source Observable completed without emitting.

## Example

Throw an error if the document wasn't clicked within 1 second

```ts
import { fromEvent, takeUntil, timer, throwIfEmpty } from 'rxjs';

const click$ = fromEvent(document, 'click');

click$
  .pipe(
    takeUntil(timer(1000)),
    throwIfEmpty(() => new Error('The document was not clicked within 1 second'))
  )
  .subscribe({
    next() {
      console.log('The document was clicked');
    },
    error(err) {
      console.error(err.message);
    },
  });
```
