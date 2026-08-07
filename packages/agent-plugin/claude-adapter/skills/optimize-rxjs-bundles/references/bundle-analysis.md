# Bundle analysis

Use a clean production build and retain the stats/module graph. Record exact
Node, bundler, plugin, minifier, target, entry, and compression settings.

For RxJS 9, every direct operator/factory subpath conditionally acquires the
platform constructor and installs its own exact Symbol. Those side effects
must survive tree shaking. Import only required subpaths; importing the root
does not install the operator catalog.

Check for:

- two physical RxJS copies or versions;
- source/test/tool modules in production chunks;
- broad internal barrels or unsupported deep imports;
- duplicate ESM/CommonJS or target-specific builds;
- fallback bytes in an environment that already supplies a native Observable;
- application-level repeated stream factories in render/change detection.

Use at least a root/control entry and the changed capability entry. A shared
dependency shift can otherwise look like an operator-specific win. Preserve
side-effect metadata and execute the bundled output after every import change.
