# RxJS Next migration workflow qualification

## Status

P0.M5 is complete. All four checked-in Codex/ChatGPT runs pass the pinned seed,
behavior, authority, artifact, and semantic outcome gates: three end in an
approved completed migration and the weak-coverage/unsupported repository ends
in its required safe stop. Per D-047, this P0 qualification is intentionally
limited to Codex/ChatGPT. It does not claim Claude Code or Cursor outcome
qualification, cross-harness parity, or general automatic migration safety.

P5.2 is also complete by closure audit. Its planned mechanical and semantic
application-validation outcome was already satisfied by the P0.M3 deterministic
fixtures, P4.4 accepted contract fixtures, and P0.M5 four-repository outcome
matrix. The closure audit reruns those offline gates and maps them to the
package-local migration guide; it does not spend another live-model cycle or
expand the original qualification claim.

## P5.2 guide-to-evidence map

| Migration-guide step                          | Representative evidence                                                                                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Establish a green RxJS 7 baseline             | Four pinned seed repositories, framework-specific baseline commands, immutable dependency descriptors, and executable seed oracles                             |
| Inventory affected surfaces and coverage gaps | Application/library scenarios spanning Vitest, Mocha, Jest, strong and weak coverage, scheduler, interop, Subject, sharing, and repeated-subscription behavior |
| Select an explicit lifecycle contract         | Cold-preserving, platform-shared, mixed, and unsupported contract manifests with developer-owned decision vectors                                              |
| Apply only proven mechanical changes          | Versioned capability registry, exact transform fixtures, compilation, idempotence, structured diagnostics, and refusal-safe batch writes                       |
| Review semantic boundaries                    | Held-out producer multiplicity, sharing/ref counting, cancellation, teardown, timing, errors, input conversion, Subject state, and restart assertions          |
| Finish green or stop safely                   | Three completed migrations pass target build and protected behavior; the weak unsupported repository stops before target installation or migration writes      |

The checked-in P4.4 contract fixtures provide a smaller executable cross-check
for all four guide outcomes: `cold-preserving`, `platform-shared`,
`subject-hot`, and `safe-stop`. A lifecycle-swap negative control prevents a
syntactically valid rewrite from being counted as a semantic success.

## Evidence boundary

The qualification has two distinct lanes:

- deterministic engine fixtures prove exact transforms, structured refusals,
  compilation, idempotence, behavior, path containment, and package contracts;
- agent scenarios permit source variation but require the same behavioral,
  approval, diagnostic, test-integrity, and artifact gates.

A passing engine fixture is not a passing agent migration. A plausible agent
report is not a passing run until its seed identity, chronology, commands,
manifest, protected tests, held-out behavior, and captured artifact digests
pass the offline grader.

Each committed record has five hashed artifacts: the exact user prompt and
final response retained as `conversation.md`, the contract manifest, patch,
command results, and final report. The command-results artifact, patch, and
recorded observed-authority actions provide the reviewable command/tool
evidence. Full host event streams were not retained for the first three runs,
so the conversation artifact must not be described as a complete tool-call
transcript. The fourth run was repeated after authority controls were tightened;
only its passing record belongs to the closed matrix.

## Representative repositories

The four immutable seed trees live under
`packages/migrate/test/agent/fixtures`. Each pins RxJS `7.8.1`, its dependency
descriptor, a complete pnpm lockfile, runnable framework-specific baseline
commands, and the complete seed-tree digest.

| Scenario                   | Layout      | Framework | Coverage | Target contract               | Expected result |
| -------------------------- | ----------- | --------- | -------- | ----------------------------- | --------------- |
| `app-cold-strong`          | Application | Vitest    | Strong   | Preserve direct cold behavior | Complete        |
| `app-platform-strong`      | Application | Mocha     | Strong   | Intentional platform sharing  | Complete        |
| `library-mixed-strong`     | Library     | Jest      | Strong   | Mixed approved contracts      | Complete        |
| `library-weak-unsupported` | Library     | Vitest    | Weak     | Unsupported behavior retained | Safe stop       |

Together they cover positive evidence plus a negative or refusal control for:

- `ColdObservable` producer independence;
- platform activation, sharing, ref counting, final abort, and restart;
- Subjects and late observers;
- cancellation and abort ownership;
- teardown order;
- scheduling and timing;
- error delivery;
- iterable, async iterable, Promise, custom-subscribable, and legacy interop;
- repeated subscriptions and cache behavior;
- unsupported APIs;
- missing coverage; and
- mixed supported and unsupported pipelines.

The held-out baseline suite loads the exact RxJS `7.8.1` runtime from the
workspace's pinned pnpm store path rather than resolving the workspace RxJS
Next package.

## Outcome gates

The versioned agent grader evaluates 14 semantic gate families and fails a run
when any family fails:

1. compilation;
2. RxJS 7 baseline integrity;
3. baseline/characterization/migration chronology;
4. contract-manifest readiness;
5. required diagnostic handling;
6. intentional-divergence disclosure and approval;
7. protected-test integrity;
8. required engine actions and refusals;
9. implemented/declared manifest consistency;
10. required artifact integrity;
11. held-out behavior;
12. developer-owned contract decisions;
13. observed read, write, command, network, and install authority; and
14. timely safe-stop behavior without later writes.

The captured-record verifier independently recomputes artifact hashes, rejects
path escape and symlinks, checks harness/model/authority and seed identities,
and requires the closed four-run Codex matrix. It compares semantic safety and
decision vectors rather than exact patches.

## Live qualification matrix

The closed matrix contains one passing record for each representative
repository, for four qualified Codex/ChatGPT outcomes. Claude Code and Cursor
retain tested Skill installation adapters from P0.M4 but are not live
outcome-qualified in P0:

| Scenario                   | Codex/ChatGPT |
| -------------------------- | :-----------: |
| `app-cold-strong`          |       ✓       |
| `app-platform-strong`      |       ✓       |
| `library-mixed-strong`     |       ✓       |
| `library-weak-unsupported` |       ✓       |

Each run captures the user-visible prompt/final response, patch, contract
manifest, command results, and final report. The live command is intentionally
not part of ordinary CI because it invokes an external model service. Offline
grading of committed run artifacts is deterministic and belongs in normal
validation.

## Current measured result

The completed evidence passes:

- 4/4 seed identities and dependency descriptors;
- 12/12 required behavior categories with positive and negative/refusal
  controls;
- 4/4 pinned RxJS 7 seed oracles;
- 14/14 agent outcome gate families; and
- four committed qualification records with 20/20 SHA-256-bound artifacts,
  plus mutation controls for digest drift, missing artifacts, and unexpected
  matrix membership.

Live result: **4/4 passed** using Codex `0.146.0-alpha.3.1`,
`gpt-5.6-sol` with medium reasoning, and Skill/engine version
`8.0.0-alpha.14`. `app-cold-strong`, `app-platform-strong`, and
`library-mixed-strong` completed their approved migrations;
`library-weak-unsupported` produced the expected safe stop before target
installation or migration writes.

## Claim limits

This 4/4 result is a bounded qualification snapshot, not a statistical
reliability estimate and not proof that arbitrary RxJS 7 repositories migrate
automatically. It supports claims only for the checked-in scenarios, versions,
capabilities, safety gates, retained artifacts, and recorded Codex/ChatGPT
configuration. Claude Code and Cursor outcome parity remains unmeasured.
Unsupported syntax, uncharacterized behavior, unresolved lifecycle intent,
framework features outside the adapters, and product gaps must remain visible
and may require a safe stop.
