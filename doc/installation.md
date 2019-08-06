## ES6 via npm

```shell
npm install rxjs@beta
```

Import just the parts you need and use them

```ts
import { of, fromEvent } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3).pipe(
  map(x => x + '!!!'),
);

fromEvent(input, 'input').pipe(
  map(e => e.target.value),
  filter(text => text.length < 10),
);
```


## CommonJS via npm

```shell
npm install rxjs@beta
```

Usage is pretty much the same thing, only with require:

```ts
const { of, fromEvent } = require('rxjs');
const { map, filter } = require('rxjs/operators');

of(1, 2, 3).pipe(
  map(x => x + '!!!'),
);

fromEvent(input, 'input').pipe(
  map(e => e.target.value),
  filter(text => text.length < 10),
);
```

## UMD (global script)

You can use a CDN (shown below), if you like. In this case, everything is in the same location as it would be in the ESM or CJS versions, but they're namespaced like `rxjs` or `rxjs.operators` instead of `rxjs` and `rxjs/operators`.


```ts
const { of, fromEvent } = rxjs;
const { map, filter } = rxjs.operators;

of(1, 2, 3).pipe(
  map(x => x + '!!!'),
);

fromEvent(input, 'input').pipe(
  map(e => e.target.value),
  filter(text => text.length < 10),
);
```

## CDN

For CDN, you can use [unpkg](https://unpkg.com). 

- https://unpkg.com/rxjs@beta/bundles/rxjs.umd.js
- https://unpkg.com/rxjs@beta/bundles/rxjs.umd.min.js


