# Bundle measurement workflow

Record exact package lock, Node, bundler/plugins, mode, entry, targets, module
format, code splitting, minifier, source maps, and compression settings.

Build at least:

1. a control entry with the same application/runtime baseline;
2. the current RxJS scenario; and
3. the proposed scenario.

Compare raw minified bytes plus gzip/Brotli only when those transfer formats
match deployment. Retain the module graph and per-module attribution. A shared
runtime or chunk shift must not be credited to one operator import.

Run the emitted bundle in its target environment. Check values, terminals,
cancellation, resource teardown, SSR import, and any exact Symbol call.
Micro-bundles are useful for attribution; the production graph decides impact.

Report absolute and percentage change, affected chunks, the modules removed or
added, behavior evidence, and remaining uncertainty. “Tree-shakable” is not a
measurement.
