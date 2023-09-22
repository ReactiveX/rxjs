# <img src="apps/rxjs.dev/src/assets/images/logos/Rx_Logo_S.png" alt="RxJS Logo" width="86" height="86"> RxJS: Reactive Extensions For JavaScript

![CI](https://github.com/reactivex/rxjs/workflows/CI/badge.svg)
[![npm version](https://badge.fury.io/js/rxjs.svg)](http://badge.fury.io/js/rxjs)
[![Join the chat at https://gitter.im/Reactive-Extensions/RxJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Reactive-Extensions/RxJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# RxJS 8 Monorepo

Look for RxJS and related packages under the [/packages](/packages/) directory. Applications like the [rxjs.dev](https://rxjs.dev) documentation site are under the [/apps](/apps/) directory.

[Apache 2.0 License](LICENSE.txt)

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contribution Guidelines](CONTRIBUTING.md)
- [Maintainer Guidelines](apps/rxjs.dev/content/maintainer-guidelines.md)
- [API Documentation](https://rxjs.dev/)

Reactive Extensions Library for JavaScript. This is a rewrite of [Reactive-Extensions/RxJS](https://github.com/Reactive-Extensions/RxJS) and is the latest production-ready version of RxJS. This rewrite is meant to have better performance, better modularity, better debuggable call stacks, while staying mostly backwards compatible, with some breaking changes that reduce the API surface.

## Versions In This Repository

- [master](https://github.com/ReactiveX/rxjs/commits/master) - This is all of the current work, which is against v8 of RxJS right now
- [7.x](https://github.com/ReactiveX/rxjs/tree/7.x) - This is the branch for version 7.X
- [6.x](https://github.com/ReactiveX/rxjs/tree/6.x) - This is the branch for version 6.X

Most PRs should be made to **master**.

## Important

By contributing or commenting on issues in this repository, whether you've read them or not, you're agreeing to the [Contributor Code of Conduct](CODE_OF_CONDUCT.md). Much like traffic laws, ignorance doesn't grant you immunity.

## Development

Because of [this issue](https://github.com/npm/rfcs/issues/287#issuecomment-1727960500) we're using `yarn`. (Basically the docs app uses `@types/jasmine`, and the package uses `@types/mocha` and they get hoisted to the top level by `npm install` with workspaces, and then TypeScript vomits everywhere when you try to build).

1. `cd` to the repository root
2. `yarn install` to install all dependencies
3. `yarn workspace rxjs test` will run the RxJS test suite
4. `yarn workspace rxjs.dev start` will start the rxjs.dev documentation site local development server
