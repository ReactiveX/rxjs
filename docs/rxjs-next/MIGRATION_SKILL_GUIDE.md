# RxJS 7-to-9 agent migration guide

`@rxjs/agent-plugin` is the canonical agent workflow. Its
`migrate-rxjs-7-to-9` skill combines authored behavioral guidance with a local,
read-only MCP server. Migration analysis and candidate generation now live
only in the plugin; the host agent reviews and applies accepted output.

## Install and invoke

Install `@rxjs/agent-plugin@next` with the Agent Plugins mechanism supported by
Codex, ChatGPT, Cursor, or another Agent Plugins 1.0 client, then invoke
`migrate-rxjs-7-to-9` explicitly or request an RxJS 7-to-9 migration. Claude
Code uses the generated `rxjs` adapter from this repository's `git-subdir`
marketplace entry. The adapter's skill, MCP, version, and knowledge bytes are
digest-locked to the universal package.

The MCP exposes exactly four tools:

- `migration_capabilities` returns the complete public-surface catalog and the
  smaller fixture-proved rewrite registry;
- `analyze_migration` reports imported surfaces, sharing indicators, local
  subscriber topology, lifecycle guidance, and diagnostics;
- `preview_migration` returns candidate source without reading or writing a
  repository; and
- `validate_migration_contract` checks schema separately from readiness.

Every call supplies explicit source text and repository-relative names. The
server has no project filesystem authority. It rejects malformed requests and
batches above 25 files, 512 KiB per file, or 2 MiB total before producing any
partial result.

## Lifecycle rule

An ordinary RxJS 7 `Observable` maps one-for-one to an RxJS 9
`ColdObservable`: each direct subscription creates and owns producer work.
That is the migration default, including when the caller omits MCP or legacy
CLI mode. Exact Symbol operators preserve the cold construction contract.

Platform Observable is an evidence-backed optimization. Promote a unit only
when either:

- characterized RxJS 7 sharing or multicasting has connector, replay, reset,
  ref-count, cancellation, and restart behavior compatible with the platform
  lifecycle; or
- repository-wide analysis proves that only one subscriber can exist at a
  time, including templates, framework bindings, helpers, exports,
  retry/repeat paths, async iteration, and indirect consumers.

A file-local `share()` or single `.subscribe()` call nominates a candidate; it
does not prove promotion. After promotion, prefer a native platform method
when the catalog records a semantic match because it avoids an RxJS extension
import and can reduce browser bundle size.

## Complete guidance versus automatic edits

The generated catalog covers all named public RxJS 7.8.2 exports from `rxjs`,
`rxjs/operators`, `rxjs/ajax`, `rxjs/fetch`, `rxjs/webSocket`, and
`rxjs/testing`, plus cross-cutting scheduler, deep-import, interop, and
deprecated-alias concerns. Each surface has a target/disposition even when a
mechanical rewrite would be unsafe.

Only the versioned, fixture-proved capability registry authorizes automatic
edits. Unproved overloads, shadowed bindings, mixed unsupported pipelines, and
manual/unsupported catalog entries remain visible safe stops. Catalog coverage
must never be represented as blanket codemod coverage.

## Permissions and validation

Start with repository read access. The migration skill applies reviewed MCP
output only through the host agent's ordinary editing tools and only after the
developer has approved the affected scope. Allow repository-declared build,
type, lint, and test commands; do not grant production credentials,
publication authority, destructive authority, or project-wide write access by
default.

Release validation is deterministic and free: schema and skill checks,
declaration completeness, fixtures, types, packages, protocol lifecycle, and
discovery-only client checks. Do not invoke a model, consume credits, or
require paid authentication as a release gate.

## Discovery smoke scenario

For a read-only host smoke, ask:

> Do not edit files or run commands. State the safe RxJS 7 Observable target,
> and name the evidence required before using the platform Observable.

The host must identify `ColdObservable` as the default, require compatible
existing sharing behavior or repository-wide single-subscriber proof for
platform promotion, and avoid claiming that local syntax proves the global
contract.
