# Pipeable Operators

Starting in version 5.5 we have shipped "pipeable operators", which can be accessed in `rxjs/operators` (notice the pluralized "operators"). These are meant to be a better approach for pulling in just the operators you need than the "patch" operators found in `rxjs-compat` package.

**NOTE**: Using `rxjs` or `rxjs/operators` without making changes to your build process can result in larger bundles. See [Known Issues](#known-issues) section below.

**Renamed Operators**

Due to having operators available independent of an Observable, operator names cannot conflict with JavaScript keyword restrictions. Therefore the names of the pipeable version of some operators have changed. These operators are:

1. `do` -> `tap`
2. `catch` -> `catchError`
3. `switch` -> `switchAll`
4. `finally` -> `finalize`

The `let` operator is now part of `Observable` as `pipe` and cannot be imported.

`source$.let(myOperator) -> source$.pipe(myOperator)`

See "[Build Your Own Operators](#build-your-own-operators-easily)" below.

The former `toPromise()` "operator" has been removed
because an operator returns an `Observable`,
not a `Promise`.
There is now an `Observable.toPromise()`instance method.

## Why?

Problems with the patched operators for dot-chaining are:

1. Any library that imports a patch operator will augment the `Observable.prototype` for all consumers of that library, creating blind dependencies. If the library removes their usage, they unknowingly break everyone else. With pipeables, you have to import the operators you need into each file you use them in.

2. Operators patched directly onto the prototype are not ["tree-shakeable"](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) by tools like rollup or webpack. Pipeable operators will be as they are just functions pulled in from modules directly.

3. Unused operators that are being imported in apps cannot be detected reliably by any sort of build tool or lint rule. That means that you might import `scan`, but stop using it, and it's still being added to your output bundle. With pipeable operators, if you're not using it, a lint rule can pick it up for you.

4. Functional composition is awesome. Building your own custom operators becomes much easier, and now they work and look just like all other operators in rxjs. You don't need to extend Observable or override `lift` anymore.

## What?

What is a pipeable operator? Simply put, a function that can be used with the current `let` operator. It used to be the origin of the name ("lettable"), but that was confusing so we now call them "pipeable" because they're intended to be used with the `pipe` utility. A pipeable operator is basically any function that returns a function with the signature: `<T, R>(source: Observable<T>) => Observable<R>`.

There is a `pipe` method built into `Observable` now at `Observable.prototype.pipe` that сan be used to compose the operators in similar manner to what you're used to with dot-chaining (shown below).

There is also a `pipe` utility function that can be imported from `import { pipe } from 'rxjs';`. The `pipe` function can be used to build reusable pipeable operators from other pipeable operators. For example:

```ts
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

const mapTwice = <T,R>(fn: (value: T, index: number) => R) => pipe(map(fn), map(fn));
```

## Usage

You pull in any operator you need from one spot, under `'rxjs/operators'` (**plural!**). It's also recommended to pull in the Observable creation methods you need directly as shown below with `range`:

```ts
import { range } from 'rxjs';
import { map, filter, scan } from 'rxjs/operators';

const source$ = range(0, 10);

source$.pipe(
  filter(x => x % 2 === 0),
  map(x => x + x),
  scan((acc, x) => acc + x, 0)
)
.subscribe(x => console.log(x))

// Logs:
// 0
// 4
// 12
// 24
// 40
```

## Build Your Own Operators Easily

You, in fact, could _always_ do this with `let`... but building your own operator is now as simple as writing a function. Notice, that you can compose your custom operator in with other rxjs operators seamlessly.

```ts
import { Observable, interval } from 'rxjs';
import { filter, map, take, toArray } from 'rxjs/operators';

/**
 * an operator that takes every Nth value
 */
const takeEveryNth = (n: number) => <T>(source: Observable<T>) =>
  new Observable<T>(observer => {
    let count = 0;
    return source.subscribe({
      next(x) {
        if (count++ % n === 0) observer.next(x);
      },
      error(err) { observer.error(err); },
      complete() { observer.complete(); }
    })
  });

/**
 * You can also use an existing operator like so
 */
const takeEveryNthSimple = (n: number) => <T>(source: Observable<T>) =>
  source.pipe(filter((value, index) => index % n === 0 ))

/**
 * And since pipeable operators return functions, you can further simplify like so
 */
const takeEveryNthSimplest = (n: number) => filter((value, index) => index % n === 0);

interval(1000).pipe(
  takeEveryNth(2),
  map(x => x + x),
  takeEveryNthSimple(3),
  map(x => x * x),
  takeEveryNthSimplest(4),
  take(3),
  toArray()
)
.subscribe(x => console.log(x));
// Logs:
// [0, 2304, 9216]
```

## Known Issues

### TypeScript < 2.4
In TypeScript 2.3 and lower, typings will need to be added to functions passed to operators, as types cannot be inferred prior to TypeScript 2.4. In TypeScript 2.4, types will infer via composition properly.

**TS 2.3 and under**

```ts
range(0, 10).pipe(
  map((n: number) => n + '!'),
  map((s: string) => 'Hello, ' + s),
).subscribe(x => console.log(x))
```

**TS 2.4 and up**

```ts
range(0, 10).pipe(
  map(n => n + '!'),
  map(s => 'Hello, ' + s),
).subscribe(x => console.log(x))
```

### Build and Treeshaking

When importing from a manifest (or re-export) file, an application bundle can sometimes grow. Pipeable operators can now be imported from `rxjs/operators`, but doing so without changing your build process will often result in a larger application bundle. This is because by default `rxjs/operators` will resolve to the CommonJS output of rxjs.

In order to use the new pipeable operators and not gain bundle size, you will need to change your Webpack configuration. This will only work with Webpack 3+ as it relies on the new `ModuleConcatenationPlugin` from Webpack 3.

**path-mapping**

Published along with rxjs 5.5 is builds of rxjs in ECMAScript Module format (imports and exports) with both ES5 and ES2015 language level. You can find these distributions in `node_modules/rxjs/_esm5` and `node_modules/rxjs/_esm2015` ("esm" stands for ECMAScript Modules and the number "5" or "2015" is for the ES language level). In your application source code, you should import from `rxjs/operators`, but in your Webpack configuration file you will need to re-map imports to the ESM5 (or ESM2015) version.

If you `require('rxjs/_esm5/path-mapping')`, you will receive a function that returns an object of key-value pairs mapping each input to it's file location on disk. Utilize this mapping as follows:

**webpack.config.js**

Simple configuration:

<!-- skip-example -->
```js
const rxPaths = require('rxjs/_esm5/path-mapping');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: 'index.js',
  output: 'bundle.js',
  resolve: {
    // Use the "alias" key to resolve to an ESM distribution
    alias: rxPaths()
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
};
```

More complete configuration (closer to a real-world scenario):

<!-- skip-example -->
```js
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const rxPaths = require('rxjs/_esm5/path-mapping');

var config = {
    devtool: isProd ? 'hidden-source-map' : 'cheap-eval-source-map',
    context: path.resolve('./src'),
    entry: {
        app: './index.ts',
        vendor: './vendor.ts'
    },
    output: {
        path: path.resolve('./dist'),
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        devtoolModuleFilenameTemplate: function (info) {
            return "file:///" + info.absoluteResourcePath;
        }
    },
    module: {
        rules: [
            { enforce: 'pre', test: /\.ts$|\.tsx$/, exclude: ["node_modules"], loader: 'ts-loader' },
            { test: /\.html$/, loader: "html" },
            { test: /\.css$/, loaders: ['style', 'css'] }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
        modules: [path.resolve('./src'), 'node_modules'],
        alias: rxPaths()
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': { // eslint-disable-line quote-props
                NODE_ENV: JSON.stringify(nodeEnv)
            }
        }),
        new webpack.HashedModuleIdsPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new HtmlWebpackPlugin({
            title: 'Typescript Webpack Starter',
            template: '!!ejs-loader!src/index.html'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity,
            filename: 'vendor.bundle.js'
        }),
        new webpack.optimize.UglifyJsPlugin({
            mangle: false,
            compress: { warnings: false, pure_getters: true, passes: 3, screw_ie8: true, sequences: false },
            output: { comments: false, beautify: true },
            sourceMap: false
        }),
        new DashboardPlugin(),
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: true,
                    failOnHint: true
                }
            }
        })
    ]
};

module.exports = config;
```
