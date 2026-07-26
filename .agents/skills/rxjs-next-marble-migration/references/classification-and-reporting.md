# Classification and reporting

Give every selected RxJS 7 test one classification and one disposition.

## Compatibility classification

| Classification            | Use when                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `portable`                | The original behavioral claim remains valid for the platform operator                |
| `harness-rewrite`         | The claim remains required, but old scheduler machinery cannot express it correctly  |
| `compatibility-only`      | The claim requires RxJS 7 cold, subscription, subject, scheduler, or import behavior |
| `intentional-divergence`  | Platform semantics require a different reviewed result                               |
| `unsupported-or-obsolete` | The feature is absent or the case protects removed internals                         |

Do not classify a failing implementation as an intentional divergence unless
the intended contract actually requires the difference.

## Port disposition

| Disposition               | Meaning                                                                   |
| ------------------------- | ------------------------------------------------------------------------- |
| `active`                  | The migrated case is runnable and expected to pass in its declared modes  |
| `expected-failure`        | The migration is faithful, but current product behavior fails it          |
| `missing-api`             | The test is preserved, but the required Next API does not exist           |
| `deduplicated`            | Another migrated case proves the identical claim; retain a canonical link |
| `unsupported-or-obsolete` | No runnable port is appropriate; record a concrete rationale              |

## Deduplication

Use analyzer fingerprints only to find candidates. Before consolidating, verify
that all of these match:

- public API and overload under test;
- cold or platform lifecycle;
- values, timing, completion, and error claim;
- cancellation and subscription claim;
- relevant type behavior.

Preserve every original test title or identifier under the canonical case.

## Missing APIs

Before assigning `missing-api`, check for:

- an exact exported RxJS Next Symbol;
- a documented unified Symbol with a mechanical argument adapter;
- a documented ambient-platform construction for a creation function.

For a unified API, distinguish the capability itself from unsupported legacy
overloads. Keep the supported mapping executable and classify mismatching
overloads as expected failures or semantic-review cases.

Do not import a nonexistent module or create a fake passing operator. Preserve
the migrated case body in the project's pending-test mechanism or migration
report, record the intended public surface, and give it `missing-api`.

## Verification report

Separate:

- **migration failures:** invalid syntax, wrong helper mapping, altered marble
  meaning, missing `await`, lost assertions, or incorrect mode selection;
- **product failures:** missing operators, behavior differences, type failures,
  or unsupported compatibility;
- **environment limitations:** no native Observable, unavailable browser
  runner, or missing optional host timing API.
