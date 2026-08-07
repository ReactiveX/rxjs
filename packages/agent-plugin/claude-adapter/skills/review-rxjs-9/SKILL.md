---
name: review-rxjs-9
description: Review RxJS 9 code for platform lifecycle correctness, exact Symbol usage, AbortSignal ownership, native/fallback safety, input conversion, Subjects, teardown, reentrancy, and tests. Use only when the reviewed code targets RxJS 9.
---

# Review RxJS 9

Confirm the version and review the subscription tree from consumer to sources,
then notifications from sources back to consumers.

Prioritize findings that can change behavior:

- code assuming one producer per observer on a platform Observable;
- captured return values from platform `subscribe()` or missing AbortSignal
  ownership;
- RxJS string-named prototype additions or a Symbol imported from the wrong
  package copy;
- operator results that bypass the receiver's construction contract;
- inputs that rely on RxJS 7 arbitrary subscribables;
- teardown after downstream notification when synchronous reentrancy can do
  extra work;
- Subject feedback, exposed writes, stale replay, or incorrect terminal state;
- native/fallback or concurrent-observer behavior absent from tests.

Lead with concrete file/line findings. Separate confirmed bugs, risks, design
tradeoffs, and readability suggestions. Recommend the smallest
behavior-preserving correction.

Read the [review checklist](references/review-checklist.md).
