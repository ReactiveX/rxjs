# Verification, repair, and closeout

Use this reference during Stages 7 and 8. Outcome evidence outranks source
shape.

## Verification ladder

Run checks from narrowest to broadest so a failure remains diagnosable:

1. parse and format the changed files;
2. run focused type checks;
3. run characterization and directly migrated tests;
4. run the affected package or workspace build, type, lint, and test gates;
5. run agreed integration, browser, native/polyfill, or repository-wide gates;
6. repeat any command whose environment was changed during diagnosis.

Record the exact command, relevant environment facts, exit code, status, and a
concise summary. “Passed locally” without a command and environment is not a
verification record.

For lifecycle-sensitive code, verify the contract actually selected:

- producer activation count and restart;
- concurrent and late observation;
- individual and final cancellation;
- abort reason and upstream closure;
- Subject current/replay/terminal behavior;
- teardown ordering;
- time and scheduling order;
- error delivery and late/unhandled error behavior; and
- input conversion acceptance or explicit refusal.

## Failure classification and response

| Class                  | Meaning                                                                          | Required response                                                                  |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Migration defect       | The edit broke syntax, types, test intent, mapping, or selected contract         | Repair a small batch and rerun affected gates                                      |
| RxJS Next product gap  | The accepted target surface cannot satisfy preserved evidence                    | Keep evidence visible; report the product gap                                      |
| Intentional divergence | Approved Next behavior differs from the RxJS 7 claim                             | Record old/new claims, impact, evidence, and approval before changing expectations |
| Baseline/environment   | The failure existed before migration or the required runtime/tool is unavailable | Preserve its original status and record the limitation or accepted failure         |
| Unknown                | Evidence does not yet identify the cause                                         | Investigate or pause; never relabel for convenience                                |

Allowed repairs clarify or correct migrated code, strengthen characterization,
or fix a demonstrated migration defect while preserving the approved contract.

The following require a developer pause:

- deleting, skipping, quarantining, or weakening a test;
- changing a public behavioral claim;
- adding a local operator, scheduler, compatibility facade, or assertion shim;
- changing platform behavior to imitate RxJS 7;
- broad dependency or configuration changes beyond reviewed scope; or
- accepting a red or unrun required gate.

## Manifest closeout

Build the manifest against the exact schema exported by the installed package.
At minimum, record the schema and engine identity required by that version,
capability-registry version, canonical Skill digest, exact source and target
RxJS versions, baseline checks, migration units, diagnostics, intentional
divergences, verification results, and blockers.

Structural validity answers only “is this shaped correctly?” Run the separate
readiness assessment to detect unresolved lifecycle units, pending approvals,
unresolved/refused diagnostics, unapproved divergences, missing or red gates,
identity mismatches, and unaccepted blockers.

An accepted blocker must name:

- its owner and reason;
- affected units;
- supporting evidence;
- the behavior, environment, or release claim it prevents; and
- explicit developer acceptance.

Do not use a blocker to hide an unexplained regression. A migration may close
as `ready-with-accepted-blockers` only when the installed readiness assessment
returns that state and the human-readable report makes the limitations clear.

## Final handoff

Use the report asset to summarize:

- scope and provenance;
- installed engine, registry, Skill, source RxJS, and target RxJS identity;
- RxJS 7 baseline and characterization evidence;
- lifecycle decisions and approvals;
- changed source and tests by coherent batch;
- exact final commands and results;
- diagnostics and how each was resolved or carried;
- repaired migration defects;
- remaining product gaps, divergences, and environment limits; and
- blocker ownership and next actions.

Do not report “automatic migration succeeded.” State the measured project
outcome and its limits.
