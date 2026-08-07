# RxJS 9.0.0-beta.1

This synchronized beta introduces `@rxjs/agent-plugin`, the official agent
experience for RxJS 7 and RxJS 9.

The plugin contains eleven portable Agent Skills for migration, authoring,
review, testing, debugging, performance, library API design, framework
integration, and bundle optimization. Its local MCP server exposes four
read-only migration tools. It accepts explicit source text, has no repository
filesystem authority, and refuses oversized or malformed batches atomically.

`@rxjs/migrate@9.0.0-beta.1` remains fully functional for existing API and CLI
users, but new agent workflows should use `@rxjs/agent-plugin`. It will be
deprecated on npm only after the replacement is published and verified.

All blocking plugin checks are deterministic and free. Schema, package,
fixture, type, framework, client-discovery, and MCP lifecycle checks may run;
model calls, credit-consuming evaluations, and paid authentication are not
release requirements.
