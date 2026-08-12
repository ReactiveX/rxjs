# Contributing to `rxjs`

RxJS 9 is a platform-based generation, not an incremental RxJS 7 port. Before
changing source or public behavior, read the repository charter, architecture,
decisions, active project plan, open questions, and compatibility policy under
`../../docs/rxjs-next`.

## Architectural rules

- Preserve a conforming native Observable; initialize the fallback only when
  the realm does not already supply one.
- Export exact, module-owned Symbols and install RxJS behavior only at those
  keys. Do not add string-named RxJS methods or use `Symbol.for` for public
  operators.
- Keep platform sharing semantics separate from `ColdObservable` and other
  explicit producer-per-subscription contracts.
- Base cancellation and teardown on `AbortSignal` and Subscriber lifecycle.
- Treat the source-pinned RxJS 7 corpus as classified migration evidence. Do
  not revive unsupported internals merely to turn an intentional divergence
  green.
- Update package-local documentation with public exports, lifecycle,
  distribution, or release-gate changes.

## Fast checks

From the repository root:

```sh
pnpm --filter rxjs exec vitest --run src
pnpm --filter rxjs run test:types
pnpm --filter rxjs run test:package
pnpm run test:kernel
pnpm run release:check
```

Use `pnpm --filter rxjs run test:watch` for focused development. Run the
narrowest relevant browser, performance, or WPT gate for changes that affect
those contracts; the commands and exact matrix are in
[`docs/RELEASE_GATES.md`](docs/RELEASE_GATES.md).

The cold and fallback ported audits intentionally retain reviewed lifecycle
and arbitrary-subscribable divergences. A raw nonzero all-mode result does not
authorize weakening platform semantics or hiding cases behind skips.

## Project-plan discipline

The active queue is `../../docs/rxjs-next/PROJECT_PLAN.md`. Work on its sole
`NEXT` item unless the user changes priority or a small prerequisite is
required. Completion requires evidence and a session-log entry, not only a
source change.
