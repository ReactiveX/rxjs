# Conversion to Promises

The similarity between Observables and Promises is that both [collections](/guide/observable) may produce values over
time, but the difference is that Observables may produce none or more than one value, while Promises produce only one
value when resolved successfully.

# Issues

For this reason, in RxJS 7, the return type of the Observable's [`toPromise()`](/api/index/class/Observable#toPromise)
method has been fixed to better reflect the fact that Observables can yield zero values. This may be a **breaking
change** to some projects as the return type was changed from `Promise<T>` to `Promise<T | undefined>`.

Also, `toPromise()` method name was never indicating what emitted value a Promise will resolve with because Observables
can produce multiple values over time. When converting to a Promise, you might want to choose which value to pick -
either the first value that has arrived or the last one. To fix all these issues, we decided to deprecate `toPromise()`,
and to introduce the two new helper functions for conversion to Promises.

# Use one of the two new functions

As a replacement to the deprecated `toPromise()` method, you should use one of the two built in static conversion
functions {@link firstValueFrom} or {@link lastValueFrom}.

## `lastValueFrom`

The `lastValueFrom` is almost exactly the same as `toPromise()` meaning that it will resolve with the last value that has
arrived when the Observable completes, but with the difference in behavior when Observable completes without emitting a
single value. When Observable completes without emitting, `toPromise()` will successfully resolve with `undefined` (thus
the return type change), while the `lastValueFrom` will reject with the {@link EmptyError}. Thus, the return type of the
`lastValueFrom` is `Promise<T>`, just like `toPromise()` had in RxJS 6.

### Example

```ts
import { interval, lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

async function execute() {
  const source$ = interval(2000).pipe(take(10));
  const finalNumber = await lastValueFrom(source$);
  console.log(`The final number is ${finalNumber}`);
}

execute();

// Expected output:
// "The final number is 9"
```

## `firstValueFrom`

However, you might want to take the first value as it arrives without waiting an Observable to complete, thus you can
use `firstValueFrom`. The `firstValueFrom` will resolve a Promise with the first value that was emitted from the
Observable and will immediately unsubscribe to retain resources. The `firstValueFrom` will also reject with an
{@link EmptyError} if the Observable completes with no values emitted.

### Example

```ts
import { interval, firstValueFrom } from 'rxjs';

async function execute() {
  const source$ = interval(2000);
  const firstNumber = await firstValueFrom(source$);
  console.log(`The first number is ${firstNumber}`);
}

execute();

// Expected output:
// "The first number is 0"
```

<span class="informal">Both functions will return a Promise that rejects if the source Observable errors. The Promise
will reject with the same error that the Observable has errored with.</span>

# Use default value

If you don't want Promises created by `lastValueFrom` or `firstValueFrom` to reject with {@link EmptyError} if there
were no emissions before completion, you can use the second parameter. The second parameter is expected to be an object
with `defaultValue` parameter. The value in the `defaultValue` will be used to resolve a Promise when source Observable
completes without emitted values.

```ts
import { firstValueFrom, EMPTY } from 'rxjs';

const result = await firstValueFrom(EMPTY, { defaultValue: 0 });
console.log(result);

// Expected output:
// 0
```

# Warning

Only use `lastValueFrom` function if you _know_ an Observable will eventually complete. The `firstValueFrom` function should
be used if you _know_ an Observable will emit at least one value _or_ will eventually complete. If the source Observable
does not complete or emit, you will end up with a Promise that is hung up, and potentially all of the state of an async
function hanging out in memory. To avoid this situation, look into adding something like {@link timeout}, {@link take},
{@link takeWhile}, or {@link takeUntil} amongst others.
