---
name: optimize-rxjs-bundles
description: Analyze and reduce RxJS 7 or RxJS 9 bundle cost using actual bundler stats, public subpath imports, side-effect rules, duplicate-package checks, target settings, and behavior-preserving measurements. Use for bundle size or tree-shaking work.
---

# Optimize RxJS Bundles

Identify the RxJS major, bundler, mode, targets, minifier, and compression
metric. Save a reproducible baseline and module graph.

- For RxJS 9, import exact capability subpaths. Extension modules are
  intentionally side-effectful so the Symbol installation is retained; the
  root remains operator-free.
- For RxJS 7, prefer supported public imports and verify the actual bundler
  graph; do not rewrite imports based on folklore.
- Look for duplicate RxJS copies, broad barrel imports, accidental test/tool
  code, multiple output dialects, polyfills already supplied by the target,
  and application code that rebuilds equivalent streams.
- Compare identical scenarios before and after with minified, gzip, and Brotli
  bytes when relevant. Include a root/control scenario so shared changes are
  not misattributed.
- Preserve runtime side effects, Symbol identity, public declarations,
  cancellation, and behavior. A smaller broken import graph is not a win.

Read [bundle analysis](references/bundle-analysis.md) for the measurement
workflow and [generated entry points](references/entry-points.md) only when
verifying an RxJS 9 public subpath.
