[API](../../index.md) / [rxjs](../index.md) / ignoreElements

# Function: ignoreElements()

```ts
function ignoreElements(): OperatorFunction<unknown, never>;
```

Defined in: [rxjs/src/internal/operators/ignoreElements.ts:40](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/ignoreElements.ts#L40)

Ignores all items emitted by the source Observable and only passes calls of `complete` or `error`.

![](/images/marble-diagrams/ignoreElements.png)

The `ignoreElements` operator suppresses all items emitted by the source Observable,
but allows its termination notification (either `error` or `complete`) to pass through unchanged.

If you do not care about the items being emitted by an Observable, but you do want to be notified
when it completes or when it terminates with an error, you can apply the `ignoreElements` operator
to the Observable, which will ensure that it will never call its observers’ `next` handlers.

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`unknown`, `never`\>

A function that returns an empty Observable that only calls
`complete` or `error`, based on which one is called by the source
Observable.

## Example

Ignore all `next` emissions from the source

```ts
import { of, ignoreElements } from 'rxjs';

of('you', 'talking', 'to', 'me')
  .pipe(ignoreElements())
  .subscribe({
    next: (word) => console.log(word),
    error: (err) => console.log('error:', err),
    complete: () => console.log('the end'),
  });

// result:
// 'the end'
```
