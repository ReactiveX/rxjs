# RxJS 9.0.0-beta.1

This synchronized beta introduces `@rxjs/agent-plugin`, the official agent
experience for RxJS 7 and RxJS 9.

The plugin contains thirteen portable Agent Skills for migration, authoring,
review, testing, performance, library API design, framework integration, and
bundle optimization, with dedicated debugging skills for RxJS 7 and RxJS 9.
Its local MCP server exposes four read-only migration tools. It accepts
explicit source text, has no repository filesystem authority, and refuses
oversized or malformed batches atomically.

Migration tooling is consolidated in `@rxjs/agent-plugin`. Its Skill owns the
workflow, its read-only MCP owns bounded analysis and previews, and the host
agent applies reviewed output with ordinary editing tools.

The plugin gate includes 114 deterministic tests. Its packed-artifact test
starts the published stdio bundle and verifies all four tools, strict schemas
and read-only annotations, text/structured response parity, exact batch
boundaries, every post-schema structured refusal, malformed protocol input, safe stops,
and clean shutdown. No source tests or build-time runtime dependencies ship in
the npm artifact.

All blocking plugin checks are deterministic and free. Schema, package,
fixture, type, framework, client-discovery, and MCP lifecycle checks may run;
model calls, credit-consuming evaluations, and paid authentication are not
release requirements.
