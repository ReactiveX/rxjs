# RxJS Next open questions

Only genuinely unresolved decisions belong here. Resolved package, Symbol,
runtime, migration-product, and documentation-site questions remain in
`DECISIONS.md` and the archived Phase 0–6 plan.

## Release-blocking for the agent plugin

There are currently no unresolved architecture decisions blocking local
implementation or deterministic qualification of
`@rxjs/agent-plugin@9.0.0-beta.1`.

Publication still requires external operator actions rather than a design
answer:

- publish and verify the five beta.1 artifacts in D-061 order;
- verify registry integrity and npm channel state;
- deprecate `@rxjs/migrate` only after that verification;
- remove the migration workspace only after deprecation is visible;
- prepare and publish the RxJS 7 documentation-only backport after the plugin
  has a stable public installation URL.

These actions remain P7.9 and P7.10 work. They must not be inferred from a local
passing test run.

## Open product questions after beta.1

### 1. Which follow-on skills have real usage evidence?

Candidates are Observable timeline visualization, custom-operator authoring,
web-platform interop, and production observability. Add one only when user
requests and review outcomes show a narrow trigger that does not overlap the
beta.1 suite.

### 2. Which additional MCP tools justify a protocol surface?

Candidates are versioned API lookup/comparison, project-wide usage inventory,
profile and heap-trace analysis, bundle-stat analysis, and marble rendering.
An MCP tool must offer structured, repeatable value beyond a Skill plus normal
agent tools and must have a bounded authority model.

### 3. When can framework guidance claim RxJS 9 compatibility?

The beta.1 skill records tested integration techniques and exact framework
versions. It must not claim official compatibility until each framework's own
dependency or peer contract permits RxJS 9. Angular 22.1 currently declares
RxJS `^6.5.3 || ^7.4.0`, so its RxJS 9 material is explicitly experimental
integration guidance rather than an Angular support claim.

### 4. What discovery evidence should become a stable support claim?

Beta.1 validates Agent Plugins and Agent Skills schemas, packed MCP behavior,
the generated Claude adapter, and discovery-only client checks when clients are
available without paid authentication. Broader client versions, marketplaces,
and outcome reliability require real usage evidence after release. No paid or
model-backed check becomes a release requirement under D-062.
