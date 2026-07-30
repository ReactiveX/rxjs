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

Requires Node `18.13–18.x`, `20.9–20.x`, or `24.x` and pnpm `10.34.5`. Run
commands from the repository root.

### Start here

| Command                               | Use it for                         |
| ------------------------------------- | ---------------------------------- |
| `pnpm install`                        | Install all workspace dependencies |
| `pnpm exec nx show projects`          | List workspace project names       |
| `pnpm --filter <project> run`         | List a project's available scripts |
| `pnpm --filter rxjs.dev run start` ⭐ | Start the documentation site       |

Projects: `@rxjs/observable-polyfill`, `@rxjs/observable`, `@rxjs/test`,
`rxjs`, and `rxjs.dev`.

### Fast feedback

| Command                                               | When to use it                           |
| ----------------------------------------------------- | ---------------------------------------- |
| `pnpm --filter rxjs run test:watch` ⭐                | Re-run focused RxJS source tests         |
| `pnpm --filter rxjs exec vitest --run <test-file>` ⭐ | Run one focused RxJS test once           |
| `pnpm --filter @rxjs/observable-polyfill run test`    | Test the platform Observable fallback    |
| `pnpm --filter @rxjs/test run test:package`           | Test, build, type-check, and import-test |
| `pnpm --filter <project> run test`                    | Run a package's relevant tests           |
| `pnpm --filter <project> run lint`                    | Lint one package                         |
| `pnpm --filter <project> run build`                   | Build one package                        |

The `rxjs` `test` command delegates to `test:unit`: it runs focused source
specs, then the strict cold and polyfill RxJS 7 parity cases. That parity suite
is intentionally failing while P0.T3 remains active. Some package builds and
lints also have known P0.3 failures.
Use focused checks for normal development; see the
[active project plan](docs/rxjs-next/PROJECT_PLAN.md) for current baselines.

### Bundle-size spot checks

`pnpm run analyze:bundles` builds the current RxJS Next source with and without
the Observable fallback, compares both bundles with published RxJS `7.8.2`,
and opens one static webpack-bundle-analyzer report. The command installs its
pinned analyzer toolchain in a disposable directory rather than changing this
workspace's dependencies or lockfile.

Published-version bundle maps are cached under
`.cache/rxjs-bundle-analysis/`; current workspace bundles are always rebuilt.
Exact cached versions can be reused without registry access; npm tags are
resolved to an exact version on every run. Pass `--rxjs-version` more than once
to select other releases or npm tags, `--refresh` to rebuild the selected
published caches, or `--no-open` to write the report without opening it:

```sh
pnpm run analyze:bundles -- --rxjs-version 7.8.1 --rxjs-version next
pnpm run analyze:bundles -- --refresh --no-open
```

The generated report, combined Webpack stats, and standalone bundles are under
`dist/bundle-analysis/`.

### Documentation site

| Command                                         | Use it for                |
| ----------------------------------------------- | ------------------------- |
| `pnpm --filter rxjs.dev run start` ⭐           | Start the local site      |
| `pnpm --filter rxjs.dev run docs`               | Regenerate API content    |
| `pnpm --filter rxjs.dev run build`              | Build the production site |
| `pnpm --filter rxjs.dev run test --watch=false` | Run site tests once       |

See the [documentation app guide](apps/rxjs.dev/README.md) for Docker,
end-to-end, and deployment workflows.

### Web Platform Tests

| Command                         | Use it for                                   |
| ------------------------------- | -------------------------------------------- |
| `pnpm run wpt:verify-import` ⭐ | Verify the pinned upstream test import       |
| `pnpm run wpt:doctor`           | Check or prepare browser prerequisites       |
| `pnpm run test:wpt`             | Run the attested Observable conformance gate |

See the [WPT guide](packages/observable-polyfill/test/wpt/README.md) before
importing upstream changes or updating expectations.

### Maintainers

| Command                                  | Use it for                                |
| ---------------------------------------- | ----------------------------------------- |
| `pnpm run prepare-packages`              | Exercise publication preparation          |
| `pnpm run release -- --gitRemote origin` | Preview a release; dry-run is the default |

Release preparation currently reaches the known P0.3 package-build baseline.
See the [maintainer guidelines](apps/rxjs.dev/content/maintainer-guidelines.md)
before publishing.
