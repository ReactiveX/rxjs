# Duplicate packages and output targets

Inspect the lockfile and bundle graph for multiple physical RxJS copies,
versions, module formats, or target variants.

Duplicate RxJS 9 extension packages are not only a byte problem: module-owned
exact Symbols from physical copies are different identities. One copy can
install `[map]` while another copy's imported `map` cannot address it. Do not
“solve” this with `Symbol.for()`; that creates a global collision and
incompatible-version overwrite surface unless a full registry protocol exists.

Check:

- workspace/link/alias resolution;
- nested peer dependency fallbacks;
- ESM and CommonJS copies in one graph;
- modern and legacy target chunks both loaded by the same client;
- duplicated polyfills already supplied by the deployment target; and
- server modules leaking into browser output.

Deduplicate through dependency/peer resolution and supported aliases, then run
packed-consumer and runtime Symbol-identity tests. Changing the target matrix
can exclude users; treat that as a product decision, not a size-only tweak.
