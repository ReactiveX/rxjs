# Official RxJS Agent Plugin

`@rxjs/agent-plugin` is the recommended RxJS experience for AI coding agents.
It follows the Agent Plugins 1.0 and Agent Skills specifications and keeps
RxJS 7 and RxJS 9 semantics separate.

## What it helps with

- migrate reviewed source from RxJS 7 to RxJS 9;
- write and review RxJS 7 or RxJS 9 code;
- write version-correct tests;
- debug subscription, cancellation, sharing, and teardown behavior;
- analyze performance and bundle size;
- design reactive library APIs; and
- integrate RxJS with Angular, React, Vue, Svelte, and SolidJS.

Angular 22.1 currently declares RxJS `^6.5.3 || ^7.4.0`. The plugin does not
claim official Angular compatibility with RxJS 9 unless that peer contract
changes.

## Install

Install the npm artifact with the Agent Plugins mechanism supported by Codex,
ChatGPT, Cursor, or another Agent Plugins 1.0 client:

```shell
npm install @rxjs/agent-plugin@next
```

Claude Code users install the generated `rxjs` adapter from the RxJS
marketplace. The adapter is generated from and digest-checked against the same
skills and MCP implementation as the universal package.

## Safe migration previews

The plugin's local MCP server exposes migration capabilities, analysis,
previews, and contract validation. It receives only source text and
repository-relative names supplied by the host agent. It has no project
filesystem authority and never applies changes.

Its generated catalog covers every named public RxJS 7.8.2 export from the
root, operators, AJAX, fetch, WebSocket, and testing entry points, plus
cross-cutting scheduler, deep-import, interop, and deprecated-alias concerns.
That complete guidance is intentionally separate from the smaller set of
fixture-proved automatic rewrites.

Ordinary RxJS 7 Observables migrate to `ColdObservable` by default, preserving
one producer per direct subscription. Existing `share`-style behavior or a
repository-wide single-subscriber guarantee can justify promotion to the
platform Observable after review. A file-local pattern is only a candidate.
Once promoted, native platform methods are preferred where semantically
equivalent so browser builds avoid unnecessary RxJS extension imports.

Calls are rejected atomically above 25 files, 512 KiB per file, or 2 MiB total,
and invalid or traversing paths are refused. Apply a preview only after
reviewing its diagnostics and lifecycle choices.

The package has no postinstall script, makes no network requests, and does not
emit runtime warnings from RxJS applications.
