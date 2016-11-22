## ES6 via npm

```none
npm install rxjs-es
```

To import the entire core set of functionality:

```js
import Rx from 'rxjs/Rx';

Rx.Observable.of(1,2,3)
```

To import only what you need by patching (this is useful for size-sensitive bundling):

```js 
import { Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

Observable.of(1,2,3).map(x => x + '!!!'); // etc
```

To import what you need and use it with proposed [bind operator](https://github.com/tc39/proposal-bind-operator):

> Note: This additional syntax requires [transpiler support](http://babeljs.io/docs/plugins/transform-function-bind/) and this syntax may be completely withdrawn from TC39 without notice! Use at your own risk.

```js
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operator/map';

Observable::of(1,2,3)::map(x => x + '!!!'); // etc
```

## CommonJS via npm

```none
npm install rxjs
```

Import all core functionality:

```js
var Rx = require('rxjs/Rx');

Rx.Observable.of(1,2,3); // etc
```

Import only what you need and patch Observable (this is useful in size-sensitive bundling scenarios):

```js
var Observable = require('rxjs/Observable').Observable;
// patch Observable with appropriate methods
require('rxjs/add/observable/of');
require('rxjs/add/operator/map');

Observable.of(1,2,3).map(function (x) { return x + '!!!'; }); // etc
```

Import operators and use them _manually_ you can do the following (this is also useful for bundling):

```js
var of = require('rxjs/observable/of').of;
var map = require('rxjs/operator/map').map;

map.call(of(1,2,3), function (x) { return x + '!!!'; });
```

You can also use the above method to build your own Observable and export it from your own module.

### CommonJS with TypeScript
If you recieve an error like `error TS2304: Cannot find name 'Promise'` or `error TS2304: Cannot find name 'Iterable'` when using RxJS you may need to install a supplemental set of typings.

1. For [`typings`](https://github.com/typings/typings) users:

    `typings install es6-shim --ambient`

2. If you're not using typings the interfaces can be copied from [/es6-shim/es6-shim.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/es6-shim/es6-shim.d.ts).

3. Add type definition file included in `tsconfig.json` or CLI argument.

## All Module Types (CJS/ES6/AMD/TypeScript) via npm

To install this library via [npm](https://www.npmjs.org) **version 3**, use the following command:

```none
npm install @reactivex/rxjs
```

If you are using npm **version 2** before this library has achieved a stable version, you need to specify the library version explicitly:

```none
npm install @reactivex/rxjs@5.0.0-beta.1
```

## CDN

For CDN, you can use [unpkg](https://unpkg.com). Just replace `version` with the current
version on the link below:

For RxJS 5.0.0-beta.1 through beta.11:
https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.umd.js

For RxJS 5.0.0-beta.12 and higher:
https://unpkg.com/@reactivex/rxjs@version/dist/global/Rx.js
