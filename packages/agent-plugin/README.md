# @rxjs/agent-plugin

The official, portable agent plugin for RxJS 7 and RxJS 9. It helps agents migrate, write, review, test, debug, and optimize RxJS code while keeping version-specific semantics explicit.

The package follows Agent Plugins 1.0. Install the package with the plugin mechanism supported by your agent client. The artifact contains thirteen Agent Skills, including separate RxJS 7 and RxJS 9 debugging skills, and a prebuilt, local MCP server; it has no postinstall script and makes no network requests.

## Migration tools

The read-only MCP server exposes `migration_capabilities`, `analyze_migration`, `preview_migration`, and `validate_migration_contract`. Every request supplies source text and repository-relative names. The server has no project filesystem authority and never applies changes.

`migration_capabilities` covers every public export from the pinned RxJS 7
root, operators, AJAX, fetch, WebSocket, and testing entrypoints, plus
cross-cutting scheduler, interop, deprecated-alias, import, and type guidance.
That complete catalog is intentionally larger than the fixture-proved rewrite
registry: a covered surface may require guided work, manual review,
replacement, or an explicit unsupported result rather than automatic output.

Ordinary RxJS 7 Observables migrate conservatively to `ColdObservable`, which
preserves producer-per-direct-subscription behavior. A unit is promoted to the
platform Observable only after its existing sharing contract fits or a
repository-wide single-subscriber topology is proved. Platform-promoted
previews prefer native methods where the mapping is proved, reducing browser
bundle cost without crossing a cold lifecycle accidentally.

Requests are rejected atomically when they exceed 25 files, 512 KiB per file, or 2 MiB total, or when a name is absolute, escapes the repository, or is duplicated. A host agent can apply reviewed preview output with its ordinary editing tools.

## Versions

- RxJS 7 guidance is pinned to 7.8.2 at commit `e5351d02e225e275ac0e497c7b66eaa5f0c88791`.
- RxJS 9 guidance targets 9.0.0-beta.1.
- Node.js 22.13 or newer is required for the bundled MCP server.

All release-gating validation is deterministic and free. Client discovery checks must not invoke a model, consume credits, or require paid authentication.
