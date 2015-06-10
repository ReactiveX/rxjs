# RxJS Next

Reactive Extensions Library

## Goals

- To model/follow the [ES7 Observable Spec](https://github.com/zenparsing/es-observable) to the observable.
- Provide better performance than preceding versions of RxJS
- Provide more modular file structure in a variety of formats

## Building/Testing

The build and test structure is fairly primitive at the moment. There are various npm scripts that can be run:

- build_es6: Transpiles the TypeScript files from `src/` to `dist/es6`
- build_cjs: Transpiles the ES6 files from `dist/es6` to `dist/cjs`
- build_amd: Transpiles the ES6 files from `dist/es6` to `dist/amd`
- build_global: Transpiles/Bundles the CommonJS files from `dist/cjs` to `dist/global/RxNext.js`
- build_all: Performs all of the above in the proper order.
- build_test: builds ES6, then CommonJS, then runs the tests with `jasmine`
- test: runs tests with `jasmine`, must have built prior to running.

### Example

```sh
# build all the things!
npm run build_all
```

### Prerequisites

Currently, you need `typescript`, `jasmine`, `babel`, and `browserify` globally installed to build and test. 
This will change as the build process matures. You can install all of these with the following:
```sh
npm i -g typescript jasmine babel browserify
```

## Performance Tests

First you'll need to host the root directory under a web server, the simplest way to do that is to install `http-server` with `npm i -g http-server`,
then start it in the home directory. After that you can run `npm run build_perf` or `npm run perf` to run the performance tests with `protractor` (which also
needs to be globally installed)

### Prerequisites
Running the performance tests requires `protractor` globally installed and an http server of some sort. `http-server` the node module
will work:

```sh
npm i -g protractor http-server
```



