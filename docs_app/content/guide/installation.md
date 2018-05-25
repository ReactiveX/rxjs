# Installation Instructions

Here are different ways you can install RxJs:

## ES6 via npm

```js
npm install rxjs
```

To import the entire core set of functionality:

```js
import Rx from 'rxjs/Rx';

Rx.Observable.of(1, 2, 3);
```

To import only what you need by patching (this is useful for size-sensitive bundling):

```js
import ❴ Observable ❵ from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

Observable.of(1,2,3).map(x => x + '!!!'); // etc
```

To import what you need and use it with proposed bind operator:
Note: This additional syntax requires transpiler support and this syntax may be completely withdrawn from TC39 without notice! Use at your own risk.

```js
import ❴ Observable ❵ from 'rxjs/Observable';
import ❴ of ❵ from 'rxjs/observable/of';
import ❴ map ❵ from 'rxjs/operator/map';

Observable::of(1,2,3)::map(x => x + '!!!'); // etc
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

For CDN, you can use. [unpkg](https://unpkg.com/). Just replace version with the current version on the link below:

For RxJS 5.0.0-beta.1 through beta.11: [https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.umd.js](https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.umd.js)

For RxJS 5.0.0-beta.12 and higher: [https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.js](https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.js)
