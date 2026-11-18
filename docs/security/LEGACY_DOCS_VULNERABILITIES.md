# Legacy documentation dependency vulnerability backlog

Last reviewed: 2026-08-02. Owner: Ben Lesh (`benlesh`). Next mandatory review: 2026-10-31.

The inherited `apps/rxjs.dev` Angular 13 toolchain is outside the RxJS 9 package, test, qualification, and publication paths. It is intentionally not changed by the RxJS Next project. A path-aware npm audit on 2026-08-02 classified 253 remaining advisory paths as reachable only from that workspace after all release-reachable findings were removed.

The matching OSV IDs are temporarily recorded in the root `osv-scanner.toml`. Each exception expires within 90 days. The isolated release-train scan never loads these exceptions. A new or changed advisory path that reaches the repository root or a release package fails CI.

At each review, regenerate the scan, confirm every dependency path still begins with `apps__rxjs.dev`, remove fixed or obsolete IDs, and either refresh the exception for at most another 90 days or move the documentation application to a separately maintained repository/toolchain.

## November 18, 2026 review: renewal blocked

A fresh `pnpm@10.34.5 audit --json` on master `54796b38` returned a complete
inventory. The path classifier found 381 documentation-only advisory paths and
59 paths reaching root/package build or test tooling. The existing exceptions
have **not** been renewed: the docs-only isolation condition is no longer met.
These path findings do not establish exploitation or a vulnerability in the
published RxJS runtime.

Affected non-docs package versions include js-yaml 4.3.0, nanoid 3.3.16,
decode-uri-component 0.2.2, browserslist 4.22.3, fast-uri 3.1.5,
vitest/@vitest/mocker 4.1.10, smol-toml 1.6.1, brace-expansion 1.1.18/2.1.4/5.0.9,
axios 1.18.0, source-map-js 1.2.1, nx 23.1.1, follow-redirects 1.16.0,
vite 6.4.3, zod 3.25.76, glob 10.5.0, and minimatch 9.0.7/10.2.5/10.2.6.
Remediate and qualify these paths before regenerating exceptions; several
reported patched ranges cross major versions, so blanket overrides are not an
acceptable substitute for compatibility testing.

### Remediation on the CI-maintenance branch

Compatible patch/minor dependency updates and the tested Zod 4 migration reduce
non-docs advisory paths from 59 to **5**. A fresh complete pinned-pnpm audit
now reports 370 docs-only paths. Remaining non-docs paths are:

- `decode-uri-component@0.2.2` via Vite → Stylus → css → source-map-resolve
  (two advisories).
- `glob@10.5.0` via tshy → resolve-import.
- `minimatch@9.0.7` via the same glob chain.
- `minimatch@10.2.5` via @nx/eslint-plugin → @nx/devkit.

Patched decode-uri-component 0.5 is ESM-only, incompatible with its CommonJS
parent. A Stylus update would cross Vite 6's supported optional-peer range.
Patched glob 14 and minimatch 11 similarly cross their parents' supported
major ranges. Resolve these through tested parent/toolchain migrations or
optional-peer isolation, not blanket overrides. The fresh unsuppressed OSV
scan also retains findings in the legacy docs graph, including the
install-artifact-from-github/re2 chain, which must be reviewed independently
before generating a new baseline.

The security gate remains blocked and the old exceptions remain unchanged.
Local validation passed the RxJS source suite (750 tests), security/release
script suite (43 tests), and migration/polyfill qualification described in
the project log. Hosted WPT remains unverified: the cloud doctor downloaded
the pinned browser but Chrome exited during session creation.

After remediation, run a fresh complete npm path audit and OSV scan, review
all remaining docs-only findings, then generate with explicit review/expiry:

```sh
node scripts/security/generate-osv-baseline.mjs \
  .security/osv-root.json .security/pnpm-audit.json osv-scanner.toml \
  YYYY-MM-DD YYYY-MM-DD
```

The generator rejects incomplete audit evidence, release-reachable paths,
invalid dates, future reviews, expired dates, and windows longer than 90 days.
Do not use the example placeholders or simply advance the old exception dates.
