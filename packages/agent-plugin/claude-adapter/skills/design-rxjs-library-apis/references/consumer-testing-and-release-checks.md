# Consumer testing and release checks

Test the packed artifact from a temporary external consumer, not only the
workspace source tree.

Required evidence:

- declaration inference and failure cases under supported TypeScript versions;
- every documented public package path in ESM and supported runtime modes;
- producer lifecycle with overlapping, late, final, and restarted consumers;
- cancellation reaching the real resource;
- error, empty completion, and terminal retention behavior;
- class and/or tuple controller behavior through public commands only;
- SSR import without browser globals when promised;
- one-copy and duplicate-package behavior;
- bundle side effects for exact Symbol installation; and
- the exact supported RxJS/framework version matrix.

For a custom RxJS 9 Symbol, test a same-description `Symbol()` does not address
the extension. If the API deliberately uses `Symbol.for()`, add incompatible-
version and installation-order controls. Do not use paid model evaluation as a
release gate.
