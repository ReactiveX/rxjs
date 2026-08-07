# Imports, side effects, and tree shaking

## RxJS 9

- The root is intentionally operator-free.
- Use platform methods before adding extension imports.
- Import each required exact Symbol from its public subpath.
- Do not import an “all operators” barrel or private source path.
- Preserve extension side effects in bundler/package metadata.

Inspect the final graph: source code appearance is not proof that a side effect
was retained or removed. Execute a computed Symbol call from the emitted
bundle.

## RxJS 7

Use supported public imports and let measurements decide. Do not mass-rewrite
between root and `rxjs/operators` from folklore; bundler version, module graph,
and surrounding imports determine the result. Never trade away typing or
public support for an internal deep import.

## Application structure

Watch for test utilities, migration tools, dev-only diagnostics, server-only
code, and framework adapters entering browser chunks. Stable controller or
pipeline identity can also avoid repeated runtime setup, but runtime allocation
and transfer size are different metrics. A class may share prototype methods;
a tuple factory may minify or compose well—measure the actual application.
