# `@rxjs/migrate`

Deterministic source-migration tools used by the RxJS Next agent-first
migration workflow. The current well-tested path migrates RxJS 7
`TestScheduler` marble specs from Mocha/Chai to ordinary Vitest specs that call
`rxTest` directly. The engine is not a complete migration product and does not
choose lifecycle semantics; see
[`MIGRATION_TOOLING_DESIGN.md`](../../docs/rxjs-next/MIGRATION_TOOLING_DESIGN.md).

The package separates two concerns:

- RxJS semantics: `TestScheduler.run` to `rxTest`, pipeable operators to exact
  Symbol calls, and reviewed argument adapters.
- Test framework syntax: an optional Mocha/Chai-to-Vitest adapter. Other
  source and target frameworks can supply the same small `FrameworkAdapter`
  interface, or preserve their existing framework unchanged.

The semantic transform also operates on production TypeScript containing
RxJS 7 `pipe(...)` expressions. It does not require a test framework or a
`TestScheduler` declaration.

## CLI

Start with a dry run:

```sh
npx rxjs-migrate \
  --source-root . \
  --source-repo https://github.com/example/project \
  --source-sha abc123 \
  --mode cold \
  --framework mocha-chai-vitest \
  test/example-spec.ts
```

The command writes nothing unless `--write --out-dir <directory>` is present.
Written files are normal, locally named source files. They are meant to be
reviewed, checked in, and maintained by the destination project; there is no
runtime generator.

Use `--framework preserve` for Jest, Node test runner, another target, or a
framework migration handled by another tool. The JavaScript API accepts a
custom `FrameworkAdapter` when syntax conversion should happen in the same
pass.

## JavaScript API

```ts
import { migrateTestSource, type FrameworkAdapter } from '@rxjs/migrate';

const result = migrateTestSource(source, {
  mode: 'cold',
  capabilities: projectCapabilities,
  frameworkAdapter: myFrameworkAdapter satisfies FrameworkAdapter,
  provenance: {
    repository: 'https://github.com/example/project',
    sha: 'abc123',
    path: 'test/example-spec.ts',
  },
});
```

`defaultTestSchedulerCapabilities` is a conservative starter set, not a claim
of complete RxJS 7 compatibility. Projects can pass a reviewed capability map
to the API or CLI. Unsupported constructs remain visible as diagnostics
instead of being hidden behind compatibility helpers.

## P0.M1 MCP prototype

The source tree still contains the exploratory `rxjs-migrate-mcp` server from
P0.M1. D-046 excludes it from the accepted release product, and P0.M3 removes
its binary, export, dependencies, and tests. Do not build integrations against
this prototype.

## Review requirements

Every migrated test should contain a direct `await rxTest(...)` call. Choose
`cold()` only for producer-per-subscription evidence; use `observable()` when
the test should exercise the constructor installed at
`globalThis.Observable`. Review scheduler arguments, multiple observations,
sharing, ref counting, cancellation, and restart behavior before accepting a
mechanical migration.
