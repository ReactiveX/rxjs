[![Build Status](https://travis-ci.org/ReactiveX/rxjs.svg?branch=master)](https://travis-ci.org/ReactiveX/rxjs)
[![Coverage Status](https://coveralls.io/repos/github/ReactiveX/rxjs/badge.svg?branch=master)](https://coveralls.io/github/ReactiveX/rxjs?branch=master)
[![npm version](https://badge.fury.io/js/%40reactivex%2Frxjs.svg)](http://badge.fury.io/js/%40reactivex%2Frxjs)
[![Join the chat at https://gitter.im/Reactive-Extensions/RxJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Reactive-Extensions/RxJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Selenium Test Status](https://saucelabs.com/browser-matrix/rxjs5.svg)](https://saucelabs.com/u/rxjs5)

# RxJS 5

Reactive Extensions Library for JavaScript. This is a rewrite of [Reactive-Extensions/RxJS](https://github.com/Reactive-Extensions/RxJS) and is the latest production-ready version of RxJS. This rewrite is meant to have better performance, better modularity, better debuggable call stacks, while staying mostly backwards compatible, with some breaking changes that reduce the API surface.

[Apache 2.0 License](LICENSE.txt)

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contribution Guidelines](CONTRIBUTING.md)
- [Maintainer Guidelines](doc/maintainer-guidelines.md)
- [Creating Operators](doc/operator-creation.md)
- [Migrating From RxJS 4 to RxJS 5](MIGRATION.md)
- [API Documentation (WIP)](http://reactivex.io/rxjs)

## Versions In This Repository

- [master](https://github.com/ReactiveX/rxjs/commits/master) - commits that will be included in the next _minor_ or _patch_ release
- [next](https://github.com/ReactiveX/rxjs/commits/next) - commits that will be included in the next _major_ release (breaking changes)

Most PRs should be made to **master**, unless you know it is a breaking change.

## Important

By contributing or commenting on issues in this repository, whether you've read them or not, you're agreeing to the [Contributor Code of Conduct](CODE_OF_CONDUCT.md). Much like traffic laws, ignorance doesn't grant you immunity.

## [Installation and Usage](http://reactivex.io/rxjs/manual/installation.html)

RxJS is available on [npm](https://www.npmjs.com/package/rxjs) and [CDN](https://unpkg.com/rxjs/bundles/Rx.min.js).

## Goals

- Provide better performance than preceding versions of RxJS
- To model/follow the [Observable Spec Proposal](https://github.com/zenparsing/es-observable) to the observable.
- Provide more modular file structure in a variety of formats
- Provide more debuggable call stacks than preceding versions of RxJS

## Building/Testing

The build and test structure is fairly primitive at the moment. There are various npm scripts that can be run:

- build_es6: Transpiles the TypeScript files from `src/` to `dist/es6`
- build_cjs: Transpiles the ES6 files from `dist/es6` to `dist/cjs`
- build_amd: Transpiles the ES6 files from `dist/es6` to `dist/amd`
- build_global: Transpiles/Bundles the CommonJS files from `dist/cjs` to `dist/global/Rx.js`
- build_all: Performs all of the above in the proper order.
- build_test: builds ES6, then CommonJS, then runs the tests with `jasmine`
- build_perf: builds ES6, CommonJS, then global, then runs the performance tests with `protractor`
- build_docs: generates API documentation from `dist/es6` to `dist/docs`
- build_cover: runs `istanbul` code coverage against test cases
- test: runs tests with `jasmine`, must have built prior to running.
- tests2png: generates PNG marble diagrams from test cases.

`npm run info` will list available script.

### Example

```sh
# build all the things!
npm run build_all
```

## Performance Tests

Run `npm run build_perf` or `npm run perf` to run the performance tests with `protractor`.
Run `npm run perf_micro` to run micro performance test benchmarking operator.

## Adding documentation
RxNext uses [ESDoc](https://esdoc.org/) to generate API documentation. Refer to ESDoc's documentation for syntax. Run `npm run build_docs` to generate.

## Generating PNG marble diagrams

The script `npm run tests2png` requires some native packages installed locally: `imagemagick`, `graphicsmagick`, and `ghostscript`.

For Mac OS X with [Homebrew](http://brew.sh/):

- `brew install imagemagick`
- `brew install graphicsmagick`
- `brew install ghostscript`
- You may need to install the Ghostscript fonts manually:
  - Download the tarball from the [gs-fonts project](https://sourceforge.net/projects/gs-fonts)
  - `mkdir -p /usr/local/share/ghostscript && tar zxvf /path/to/ghostscript-fonts.tar.gz -C /usr/local/share/ghostscript`

For Debian Linux:

- `sudo add-apt-repository ppa:dhor/myway`
- `apt-get install imagemagick`
- `apt-get install graphicsmagick`
- `apt-get install ghostscript`

For Windows and other Operating Systems, check the download instructions here:

- http://imagemagick.org
- http://www.graphicsmagick.org
- http://www.ghostscript.com/
