# Generated migration capabilities

> Generated from the pinned RxJS 7 public declarations, migration-evidence
> registry, unsupported-surface catalog, and beta.1 deterministic engine. Do
> not edit by hand.

The catalog covers every public export from `rxjs`, `rxjs/operators`,
`rxjs/ajax`, `rxjs/fetch`, `rxjs/webSocket`, and `rxjs/testing` at RxJS
`7.8.2`: 248 surfaces, including
114 operators and
37 other functions. Call
`migration_capabilities` for every surface's target, disposition, lifecycle
rule, platform-method candidate, and evidence status.

RxJS 7 Observable-producing code defaults to `ColdObservable` and exact
Symbols so direct subscriptions retain producer-per-subscription behavior.
Promote a unit to the platform lifecycle only after proving intentional RxJS 7
sharing or a single-subscriber topology. Platform-mode migration then prefers
proved native methods to avoid unnecessary extension imports.

Only these bounded rewrites are mechanically fixture-proved:

- `operator.filter`
- `operator.map`
- `operator.take-until`
- `operator.buffer-count`
- `operator.concat-map`
- `operator.concat-all`
- `operator.switch-all`
- `operator.debounce-time`
- `operator.audit`
- `operator.audit-time`

Every other catalog entry is still covered, but requires the stated guided,
manual-review, replacement, or unsupported path. Catalog coverage is not a
claim that all surfaces can be transformed mechanically.
