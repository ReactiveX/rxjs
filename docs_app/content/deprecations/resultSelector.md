# ResultSelector Parameter

Some operator supported a resultSelector argument that acted as mapping function on the result of that operator.
The same behavior can be reproduced with the `map` operator, therefore this argument became deprecated.

<div class="alert is-important">
    <span>
        This deprecation was introduced in RxJS 6.0 and will become breaking with RxJS 8.
    </span>
</div>

## Operators affected by this Change

- [bindCallback](/api/index/function/bindCallback)
- [bindNodeCallback](/api/index/function/bindNodeCallback)
- [combineLatest](/api/index/function/combineLatest)
- [forkJoin](/api/index/function/forkJoin)
- [fromEvent](/api/index/function/fromEvent)
- [fromEventPattern](/api/index/function/fromEventPattern)
- [zip](/api/index/function/zip)
- [fromEventPattern](/api/index/function/fromEventPattern)
- [concatMap](/api/operators/concatMap)
- [concatMapTo](/api/operators/concatMapTo)
- [exhaustMap](/api/operators/exhaustMap)
- [mergeMap](/api/operators/mergeMap)
- [mergeMapTo](/api/operators/mergeMapTo)
- [switchMap](/api/operators/switchMap)
- [swithMapTo](/api/operators/swithMapTo)

## How to Refactor

Instead of using the `resultSelector` Argument, you can leverage the [`map`](/api/operators/map) operator.
```ts
import {of, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';

const o1$ = of([1,2,3]);
const o2$ = of([4,5,6]);

// deprecated
combineLatest([o1$, o2$], (o1, o2) => o1+o2) 
// suggested change
combineLatest([o1$, o2$]).pipe(
    map(([o1, o2]) => o1+o2);
)
```

In case of a higher-order operator, you want to consider using `map` on the inner Observable:

```ts

import {fromEvent, interval} from 'rxjs';
import {switchMap, map} from 'rxjs/operators';

// deprecated
fromEvent(document, 'click').pipe(
    switchMap(x => interval(0, 1000), (x) => x+1)
);
// suggested change
fromEvent(document, 'click').pipe(
    switchMap(x => interval(0, 1000).pipe(
        map(x => x+1)
    ))
);
```





