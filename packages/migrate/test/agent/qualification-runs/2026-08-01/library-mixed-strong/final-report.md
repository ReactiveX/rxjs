# P0.M5 final report: library-mixed-strong

Status: **completed**.

The project migrated from RxJS 7.8.1 to the exact local RxJS and Observable polyfill 8.0.0-alpha.14 tarballs. The engine's required atomic refusal is preserved in `engine-report.json`; the approved manual batch uses platform `Observable.from` and exact `map`/`windowTime` Symbol APIs.

All protected behaviors remain green:

- `PT-MIXED-ERROR`: selector error rejection preserved; `control:error-swallowed=satisfied`
- `PT-MIXED-INPUT`: iterable values remain `[2, 4]`; `control:legacy-interop=satisfied`
- `PT-MIXED-PIPELINE`: `windowTime(10)` remains present after `map` and emits a defined window; `control:mixed-segment-dropped=satisfied`

Jest was preserved. No test was removed, skipped, weakened, or renamed. There are no intentional divergences, product blockers, or remaining migration defects. Verification uses the RxJS fallback Observable because Node v24.12.0 has no native Observable implementation.

The installed contract schema validates the manifest and its separate readiness assessment is `ready`. The final lockfile resolves with a frozen, offline, lockfile-only pnpm check, and `git diff --check` is clean.
