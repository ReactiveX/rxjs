# Installation

## ECMAScript 2015 via npm

```shell
npm install rxjs
```

Import a subset of core functionality and operators. Example:

```js
import { of, fromEvent } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3).pipe(
  map(x => x * x),
);

fromEvent(input, 'input').pipe(
  map(e => e.target.value),
  filter(text => text.length < 10),
);
```

## CommonJS via npm

```shell
npm install rxjs
```

Reference with `require()`. Example:

```js
const { of, fromEvent } = require('rxjs');
const { map, filter } = require('rxjs/operators');

of(1, 2, 3).pipe(
  map(x => x * x),
);

fromEvent(input, 'input').pipe(
  map(e => e.target.value),
  filter(text => text.length < 10),
);
```

## UMD (global script)

Using `rxjs` and `rxjs.operators` namespace pattern objects:

```js
const { of, fromEvent } = rxjs;
const { map, filter } = rxjs.operators;

of(1, 2, 3).pipe(
  map(x => x * x),
);

fromEvent(input, 'input').pipe(
  map(e => e.target.value),
  filter(text => text.length < 10),
);
```

### CDN Hosted Scripts

For [unpkg](https://unpkg.com) CDN. Replace `version` in the following URLs with the current version:

- `https://unpkg.com/rxjs@version/bundles/rxjs.umd.js`
- `https://unpkg.com/rxjs@version/bundles/rxjs.umd.min.js`

List of releases can be found at <https://github.com/ReactiveX/rxjs/releases>.