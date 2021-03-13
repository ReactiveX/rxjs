# Subscribe Arguments

You might have seen that we deprecated some signatures of the `subscribe` method, which might have caused some confusion.
The `subscribe` method itself is not deprecated. We just deprecated some of the signatures to improve readability and 
API ergonomy. This deprecation also affects the [`tap` operator](../../api/operators/tap), as tap supports the same signature as the `subscribe` method.

<div class="alert is-important">
    <span>
        This deprecation was introduced in RxJS 6.4.
    </span>
</div>

In short we deprecated all signatures where you specified an anonymous `error` or `complete` callback and passed an empty function to one of the callbacks before. 

## What Signature is affected

We deprecated signatures for just passing the `complete` callback.

```ts
import { of } from 'rxjs';

// deprecated
of([1,2,3]).subscribe(null, null, console.info); // difficult to read
// suggested change
of([1,2,3]).subscribe({complete: console.info});
```

Similarly, we also deprecated signatures for solely passing the `error` callback.

```ts
import { throwError } from 'rxjs';

// deprecated 
throwError('I am an error').subscribe(null, console.error);
// suggested change
throwError('I am an error').subscribe({error: console.error});
```

Do notice, in general it is recommended only to use the anonymous function if you only specify the `next` callback otherwise
we recommend to pass an `Observer`

```ts
import { of } from 'rxjs';

// recommended 
of([1,2,3]).subscribe((v) => console.info(v));
// also recommended
of([1,2,3]).subscribe({
    next: (v) => console.log(v),
    error: (e) => console.error(e),
    complete: () => console.info('complete') 
})
```
