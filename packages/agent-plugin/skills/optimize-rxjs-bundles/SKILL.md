---
name: optimize-rxjs-bundles
description: Analyze and reduce RxJS 7 or RxJS 9 bundle cost using reproducible bundler stats, RxJS 9 platform-method-first authoring, public subpath imports, side-effect rules, duplicate-package and Symbol-identity checks, target settings, and behavior-preserving measurements. Use for bundle size or tree-shaking work.
---

# Optimize RxJS Bundles

Identify the RxJS major, bundler, mode, targets, minifier, code-splitting,
module format, and compression metric. Save a reproducible baseline and module
graph before changing imports or behavior.

For RxJS 9, prefer platform methods whenever their contracts fit. `.map()` is
normally preferable to `[map]()` for a platform-lifecycle receiver because it
does not import the side-effecting RxJS extension module; measure the exact
consumer target. Node currently needs the Observable fallback and often cares
less about bundle transfer, but semantic platform-first code remains useful.

Use this workflow:

1. Measure identical production entry points with minified/raw and relevant
   transfer sizes.
2. Attribute bytes through the module graph, source map, or bundle analyzer.
3. Remove unnecessary extension/barrel imports and duplicate package copies.
4. Preserve required exact-Symbol installation and identity.
5. Execute the bundled output and rerun behavior, SSR, cancellation, and
   package-consumer tests.

## Load references by investigation

- [Measurement workflow](references/measurement-workflow.md)
- [RxJS 9 platform methods and Symbol modules](references/rxjs-9-platform-methods-and-symbol-modules.md)
- [Imports, side effects, and tree shaking](references/imports-side-effects-and-tree-shaking.md)
- [Duplicate packages and output targets](references/duplicates-and-targets.md)
- [Good and bad bundle changes](references/good-and-bad.md)
- [Generated RxJS 9 entry points](references/entry-points.md), for verification
  only—not API recommendation.
