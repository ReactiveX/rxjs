# Array Arguments

To unify the API surface of `forkJoin` and `combineLatest` we deprecated some signatures.
Since that it is recommended to either pass an Object or an Array to these operators.

<div class="alert is-important">
    <span>
        This deprecation was introduced in RxJS 6.5.
    </span>
</div>

## Operators affected by this Change

- [combineLatest](/api/index/function/combineLatest)
- [forkJoin](/api/index/function/forkJoin)

## How to Refactor

We deprecated the signatures, where just pass all Observables directly as parameters to these operators.

```ts
import {forkJoin, from} from 'rxjs';

const odd$ = from([1,3,5]);
const even$ = from([2,4,6]);

// deprecated
forkJoin(odd$, even$);
// suggested change
forkJoin([odd$, even$]);
// or
forkJoin({odd: odd$, even: even$})
```