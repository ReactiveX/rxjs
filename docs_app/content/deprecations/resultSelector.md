# ResultSelector Parameter

Some operator supported a resultSelector argument that acted as mapping function on the result of that operator.
The same behavior can be reproduced with the `map` operator, therefore this argument became deprecated.

<div class="alert is-important">
    <span>
        This deprecation was introduced in RxJS 6.0 and will become breaking with RxJS 8.
    </span>
</div>

There were two reasons for actually deprecating those parameters:

1. It increases the bundle size of every operator
2. In some scenarios values had to be retained in memory causing a general memory pressure

## Operators affected by this Change

- [concatMap](/api/operators/concatMap)
- [concatMapTo](/api/operators/concatMapTo)
- [exhaustMap](/api/operators/exhaustMap)
- [mergeMap](/api/operators/mergeMap)
- [mergeMapTo](/api/operators/mergeMapTo)
- [switchMap](/api/operators/switchMap)
- [swithMapTo](/api/operators/swithMapTo)

## How to Refactor

Instead of using the `resultSelector` Argument, you can leverage the [`map`](/api/operators/map) operator on the inner Observable:

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





