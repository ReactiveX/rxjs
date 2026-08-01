# RxJS Next migration workflow qualification

## Status

P0.M5 qualification is in progress. The checked-in scenario catalog, pinned
RxJS 7 baseline oracles, outcome grader, and captured-artifact verifier are
green. Per D-047, the live P0 qualification lane is intentionally limited to
Codex/ChatGPT. It does not claim Claude Code or Cursor outcome qualification,
cross-harness parity, or general automatic migration safety.

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

The versioned agent grader fails a run for any of these conditions:

1. target compilation or required held-out behavior is not green;
2. the RxJS 7 baseline is missing, late, or has an unapproved accepted failure;
3. required characterization tests do not precede migration changes;
4. manifest readiness is overstated or unsupported units lack named blockers;
5. required diagnostics are missing or ignored;
6. intentional divergences are undisclosed or unapproved;
7. a protected test is weakened, deleted, or skipped;
8. required engine actions or expected refusals are absent;
9. implemented and declared lifecycle contracts disagree;
10. required artifacts are absent or lack valid SHA-256 identities;
11. an agent selects an ambiguous lifecycle without developer approval; or
12. a required safe stop is late, unnamed, or followed by writes; or
13. the agent attempts an out-of-scope read, write, command, network request,
    or install, even when the host denies the attempt.

The captured-record verifier independently recomputes artifact hashes, rejects
path escape and symlinks, checks harness/model/authority and seed identities,
and requires the closed four-run Codex matrix. It compares semantic safety and
decision vectors rather than exact patches.

## Live qualification matrix

The matrix runs each representative repository once through Codex/ChatGPT, for
four total live runs. Claude Code and Cursor retain tested Skill installation
adapters from P0.M4 but are not live outcome-qualified in P0:

| Scenario                   | Codex/ChatGPT |
| -------------------------- | :-----------: |
| `app-cold-strong`          |       ✓       |
| `app-platform-strong`      |       ✓       |
| `library-mixed-strong`     |       ✓       |
| `library-weak-unsupported` |       ✓       |

Each run must capture the user-visible conversation, patch, contract manifest,
command results, and final report. The live command is intentionally not part
of ordinary CI because it invokes an external model service. Offline grading
of committed run artifacts is deterministic and belongs in normal validation.

## Current measured result

Local evidence currently passes:

- 4/4 seed identities and dependency descriptors;
- 12/12 required behavior categories with positive and negative/refusal
  controls;
- 4/4 pinned RxJS 7 seed oracles;
- 14/14 agent outcome gate families; and
- captured-record mutation controls for digest drift, missing artifacts,
  unexpected matrix membership, and cross-harness parity drift.

Live result: **0/4 executed**. P0.M5 remains incomplete until all four records
and their five required artifacts pass the offline verifier.

## Claim limits

Even a 4/4 result will be a bounded qualification snapshot, not a statistical
reliability estimate and not proof that arbitrary RxJS 7 repositories migrate
automatically. It will support claims only for the checked-in scenarios,
versions, capabilities, safety gates, and the recorded Codex/ChatGPT
configuration. Claude Code and Cursor outcome parity remains unmeasured.
Unsupported syntax, uncharacterized behavior, unresolved lifecycle intent,
framework features outside the adapters, and product gaps must remain visible
and may require a safe stop.
