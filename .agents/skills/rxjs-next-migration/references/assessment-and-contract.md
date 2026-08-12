# Assessment, baseline, and target contract

Use this reference during Stages 2 through 4. Collect evidence before asking
the developer to choose a target contract; ask only about intent the repository
cannot prove.

## Repository assessment

Record exact file locations and the commands or tests that exercise each
finding. Search application source, shared libraries, tests, configuration,
fixtures, build tools, and framework glue for these themes:

| Theme                 | Look for                                                           | Behavioral question                                               |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Construction          | `new Observable`, `defer`, custom producers, wrappers              | When is producer work created and restarted?                      |
| Repeated subscription | retry, refresh, fan-out, cache invalidation, multiple consumers    | Must consumers run independent work or share one active run?      |
| Subjects              | current/replayed values, late subscribers, terminal state          | What exists before observation and what must late observers see?  |
| Ownership             | captured subscriptions, `unsubscribe`, component disposal          | Who cancels, with what reason, and when does upstream stop?       |
| Teardown              | multiple teardown callbacks, finalizers, resource release          | Does observable order matter?                                     |
| Timing                | schedulers, timers, animation, queue ordering, virtual time        | Which host timing boundary preserves the claim?                   |
| Errors                | selector errors, observer callback errors, late errors             | Where must the error be delivered or reported?                    |
| Inputs                | iterables, async iterables, promises, custom subscribables         | Is the value accepted by the platform conversion boundary?        |
| Composition           | pipeable operators, aliases, higher-order pipelines                | Is a fixture-proved Symbol mapping available for this exact form? |
| Testing               | TestScheduler helpers, framework assertions, native/polyfill setup | Which claims are real behavior and which are harness machinery?   |

Trace imports and helper wrappers so transitive usage is not mistaken for
absence. Sampling is acceptable only when its limits are named and accepted.

## Coverage disposition

Give every lifecycle-sensitive finding exactly one disposition:

- **Covered:** a named existing test proves the relevant behavior.
- **Characterize:** add a focused RxJS 7 test before migration.
- **Unsupported:** no accepted Next surface can preserve the required claim;
  retain evidence and record a product gap.
- **Accepted uncovered risk:** the developer explicitly accepts proceeding
  without the missing evidence; record approver, time, rationale, and impact.

Recommend characterization for repeated subscriptions, side effects, sharing,
late subscribers, cancellation, teardown, timing, errors, or public API behavior
when current tests do not prove the outcome.

## Characterization protocol

Add the narrowest test that proves an externally meaningful claim. Prefer
assertions over values, completion/error, producer start count, concurrent and
late observations, cancellation ownership, abort reason, teardown order,
virtual or host timing, and visible side effects. Avoid locking in irrelevant
RxJS 7 internals.

Run the new test on the unchanged RxJS 7 dependency. Record the exact command
and result. A characterization test added after dependency migration is not an
RxJS 7 baseline unless it is separately demonstrated against the pinned source
environment.

## Lifecycle decision record

Use only lifecycle values accepted by the installed contract-manifest schema.
Explain each selection in behavioral language:

- active platform producer shared and ref-counted while observers exist;
- producer work created per direct subscription through an explicit Next API;
- intentional hot Subject behavior;
- no producer lifecycle applies;
- required behavior is unsupported; or
- intent remains unresolved.

Do not use a blanket “hot” or “cold” label for a platform Observable. The first
observer starts an active producer, concurrent observers join it, the last
observer leaving tears it down, and a later observer can start a new run.

For every unit, record:

1. stable ID and exact source spans;
2. current RxJS 7 claim and evidence;
3. selected target lifecycle;
4. compatibility/evidence classification accepted by the installed schema;
5. one or more target claims;
6. approval status, approver, timestamp, and rationale when required; and
7. related diagnostics, divergences, and blockers.

## Mandatory developer pauses

Pause rather than infer when:

- both independent and shared producer behavior are plausible;
- repeated subscriptions may implement retry, refresh, cache, or fan-out;
- Subject replay, terminal, or late-observer behavior is unproved;
- cancellation ownership, abort reason, or teardown order could change;
- scheduler removal could alter ordering;
- a custom subscribable is outside the accepted conversion boundary;
- a public claim changes or an expectation would need to change;
- coverage is missing or the baseline is not green; or
- a unit remains unresolved, unsupported without acceptance, or pending
  approval in the readiness assessment.

The engine's diagnostic can identify a pause condition, but only the developer
can approve lifecycle intent or an intentional divergence.
