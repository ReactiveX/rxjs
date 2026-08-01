# `@rxjs/migrate`

Deterministic source-migration tools used by the RxJS 9 agent-first
migration workflow. The current well-tested path migrates RxJS 7
`TestScheduler` marble specs from Mocha/Chai to ordinary Vitest specs that call
`rxTest` directly. The engine is not a complete migration product and does not
choose lifecycle semantics; see
[`docs/MIGRATION_TOOLING_DESIGN.md`](docs/MIGRATION_TOOLING_DESIGN.md).

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
runtime generator. Successful and refused batches are emitted as versioned
JSON with the engine and capability-registry versions. Exit codes distinguish
success (`0`), a structured migration refusal (`1`), invalid arguments (`2`),
and operational failure (`3`). A refused batch writes no files.

Use `--framework preserve` for Jest, Node test runner, another target, or a
framework migration handled by another tool. The JavaScript API accepts a
custom `FrameworkAdapter` when syntax conversion should happen in the same
pass.

## JavaScript API

```ts
import { defaultCapabilityRegistry, migrateTestSource, type FrameworkAdapter } from '@rxjs/migrate';

const result = migrateTestSource(source, {
  mode: 'cold',
  capabilityRegistry: defaultCapabilityRegistry,
  frameworkAdapter: myFrameworkAdapter satisfies FrameworkAdapter,
  provenance: {
    repository: 'https://github.com/example/project',
    sha: 'abc123',
    path: 'test/example-spec.ts',
  },
});
```

`defaultCapabilityRegistry` is a versioned, fixture-backed contract, not a
claim of complete RxJS 7 compatibility. A custom registry must use the same
schema and name the installed engine version; incompatible registries are
refused without changing source bytes. Unsupported constructs remain visible
as diagnostics instead of being hidden behind compatibility helpers.

## Mechanically supported subset

The default registry currently proves direct, unshadowed `pipe(...)` calls for
`filter`, `map`, `takeUntil`, `bufferCount`, `concatMap`, `concatAll`,
`switchAll`, `debounceTime`, `audit`, and `auditTime`, subject to each mapping's
published arity and overload preconditions. The registry is the authoritative
machine-readable list. Aliases are tracked, while shadowed bindings, mixed
unsupported pipelines, scheduler overloads, malformed input, and unsupported
framework assertions are refused or preserved with structured findings.

The package ships no MCP binary, export, or runtime dependency. D-046 keeps
the library and dry-run-first CLI as the only deterministic engine surfaces.

The representative agent-workflow matrix and its deliberately bounded claims
are documented in
[`docs/MIGRATION_QUALIFICATION.md`](docs/MIGRATION_QUALIFICATION.md).
Live harness qualification is separate from deterministic engine correctness.

## Contract and Skill integrity

`parseMigrationContractManifest` validates the versioned migration decision
record. `assessMigrationContractReadiness` separately reports unresolved
lifecycle choices, approvals, diagnostics, verification, and blockers so
schema validity is never mistaken for completion.

The Node-only `@rxjs/migrate/skill` subpath computes and verifies the canonical
Skill's deterministic SHA-256 content descriptor and manages generated harness
discovery copies without creating a second authored workflow.

Install the canonical Skill into a repository with the package command:

```sh
npx rxjs-migrate-skill install --harness codex --project-root .
```

Use `--harness cursor` for Cursor; Codex and Cursor share the open
`.agents/skills` placement. Use `--harness claude` for Claude Code's
`.claude/skills` placement. The same command supports `check`, `update`, and
`remove`. It refuses to overwrite or remove local modifications unless the
developer supplies `--force`, and each installed copy records its package
version and canonical digest in `.rxjs-migrate-skill.json`.

## Review requirements

Every migrated test should contain a direct `await rxTest(...)` call. Choose
`cold()` only for producer-per-subscription evidence; use `observable()` when
the test should exercise the constructor installed at
`globalThis.Observable`. Review scheduler arguments, multiple observations,
sharing, ref counting, cancellation, and restart behavior before accepting a
mechanical migration.
