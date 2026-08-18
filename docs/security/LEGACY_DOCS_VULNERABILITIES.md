# Legacy documentation dependency vulnerability backlog

Last reviewed: 2026-08-17. Owner: Ben Lesh (`benlesh`). Next mandatory review: 2026-11-15.

The inherited `apps/rxjs.dev` Angular 13 toolchain is outside the RxJS 9 package, test, qualification, and publication paths. It is intentionally not changed by the RxJS Next project. A path-aware npm audit on 2026-08-17 classified 264 remaining advisory paths as reachable only from that workspace after all release-reachable findings were removed. Fixable root-tooling findings were removed by restoring pnpm 10 override enforcement and updating `js-yaml`, `nanoid`, and Less; the remaining findings are isolated to legacy documentation tooling.

The matching OSV IDs are temporarily recorded in the root `osv-scanner.toml`. Each exception expires within 90 days. The isolated release-train scan never loads these exceptions. A new or changed advisory path that reaches the repository root or a release package fails CI.

At each review, regenerate the scan, confirm every dependency path still begins with `apps__rxjs.dev`, remove fixed or obsolete IDs, and either refresh the exception for at most another 90 days or move the documentation application to a separately maintained repository/toolchain.
