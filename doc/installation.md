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
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

Observable.of(1,2,3).map(x => x + '!!!'); // etc
```

To import what you need and use it with ES next function bind (best overall method, if possible):

```js
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operator/map';

Observable.of(1,2,3)::map(x => x + '!!!'); // etc
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
require('rxjs/add/operator/map');

Observable.of(1,2,3).map(function (x) { return x + '!!!'; }); // etc
```

Import operators and use them _manually_ you can do the following (this is also useful for bundling):

```js
var Observable = require('rxjs/Observable').Observable;
var map = require('rxjs/operator/map').map;

map.call(Observable.of(1,2,3), function (x) { return x + '!!!'; });
```

You can also use the above method to build your own Observable and export it from your own module.

### CommonJS with TypeScript
If you recieve an error like `error TS2304: Cannot find name 'Symbol'` or `error TS2304: Cannot find name 'Iterable'` when using RxJS you may need to install a supplemental set of typings.  This small set of interfaces allows RxJS to target ES6, while still allowing the TypeScript compiler to target ES5.

1. For [`typings`](https://github.com/typings/typings) users:

    `typings install rxjs-symbol-typings`
    
2. If you're not using typings the interfaces can be copied from [/spec/es5.d.ts](https://github.com/ReactiveX/rxjs/blob/master/spec/es5.d.ts) or from the [typings repo](https://github.com/david-driscoll/rxjs-symbol-typings/blob/master/rxjs-symbol-shim.d.ts).

3. Change your `tsconfig.json` to target `es6` or `es2015`.
   
   Keep in mind that targeting ES6 may have unintended consequnces and allow you to use features that may not exist on your target platform or browser.  In this case it is recommended to use another compiler such as [babel](http://babeljs.io/) in your compile pipeline to run after the TypeScript compiler.  
    
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

For CDN, you can use [npmcdn](https://npmcdn.com). Just replace `version` with the current
version on the link below:

https://npmcdn.com/@reactivex/rxjs@version/dist/global/Rx.umd.js
