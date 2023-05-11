# Installation Instructions

Here are different ways you can install RxJS:

## ES2015 via npm

```shell
npm install rxjs
```

By default, RxJS 7.x will provide different variants of the code based on the consumer:

- When RxJS 7.x is used on Node.js regardless of whether it is consumed via `require` or `import`, CommonJS code targeting ES5 will be provided for execution.
- When RxJS 7.4+ is used via a bundler targeting a browser (or other non-Node.js platform) ES module code targeting ES5 will be provided by default with the option to use ES2015 code.
  7.x versions prior to 7.4.0 will only provide ES5 code.

If the target browsers for a project support ES2015+ or the bundle process supports down-leveling to ES5 then the bundler can optionally be configured to allow the ES2015 RxJS code to be used instead.
You can enable support for using the ES2015 RxJS code by configuring a bundler to use the `es2015` custom export condition during module resolution.
Configuring a bundler to use the `es2015` custom export condition is specific to each bundler.
If you are interested in using this option, please consult the documentation of your bundler for additional information.
However, some general information can be found here:

- https://webpack.js.org/guides/package-exports/#conditions-custom
- https://github.com/rollup/plugins/blob/node-resolve-v11.0.0/packages/node-resolve/README.md#exportconditions

To import only what you need, please {@link guide/importing#es6-via-npm check out this} guide.

## CommonJS via npm

If you receive an error like error TS2304: Cannot find name 'Promise' or error TS2304: Cannot find name
'Iterable' when using RxJS you may need to install a supplemental set of typings.

1.  For typings users:

```shell
typings install es6-shim --ambient
```

2.  If you're not using typings the interfaces can be copied from /es6-shim/es6-shim.d.ts.

3.  Add type definition file included in tsconfig.json or CLI argument.

## All Module Types (CJS/ES6/AMD/TypeScript) via npm

To install this library via npm version 3, use the following command:

```shell
npm install @reactivex/rxjs
```

If you are using npm version 2, you need to specify the library version explicitly:

```shell
npm install @reactivex/rxjs@7.3.0
```
