# Installation Instructions

Here are different ways you can install RxJs:

## ES6 via npm

```js
npm install rxjs
```

To import the entire core set of functionality:

```js
import * as rxjs from 'rxjs';

rxjs.of(1, 2, 3);
```

To import only what you need using pipeable operators:

```js
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

of(1,2,3).pipe(map(x => x + '!!!')); // etc
```
* See [Pipeable Operator Documentation](https://github.com/ReactiveX/rxjs/blob/91088dae1df097be2370c73300ffa11b27fd0100/doc/pipeable-operators.md) for more information about pipeable operator.

To use with globally imported bundle:

```js
const { of } = rxjs;
const { map } = rxjs.operators;

of(1,2,3).pipe(map(x => x + '!!!')); // etc
```

## CommonJS via npm

If you receive an error like error TS2304: Cannot find name 'Promise' or error TS2304: Cannot find name 'Iterable' when using RxJS you may need to install a supplemental set of typings.

1.  For typings users:

```js
typings install es6-shim --ambient
```

2.  If you're not using typings the interfaces can be copied from /es6-shim/es6-shim.d.ts.

3.  Add type definition file included in tsconfig.json or CLI argument.

## All Module Types (CJS/ES6/AMD/TypeScript) via npm

To install this library via npm version 3, use the following command:

```js
npm install @reactivex/rxjs
```

If you are using npm version 2 before this library has achieved a stable version, you need to specify the library version explicitly:

```js
npm install @reactivex/rxjs@5.0.0-beta.1
```

## CDN

For CDN, you can use [unpkg](https://unpkg.com/). Just replace version with the current version on the link below:

For RxJS 5.0.0-beta.1 through beta.11: [https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.umd.js](https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.umd.js)

For RxJS 5.0.0-beta.12 and higher: [https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.js](https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.js)

For RxJS 6.0.0 and higher: [https://unpkg.com/@reactivex/rxjs@version/dist/global/rxjs.umd.js](https://unpkg.com/@reactivex/rxjs@version/dist/global/rxjs.umd.js)
