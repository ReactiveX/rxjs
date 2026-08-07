---
name: debug-rxjs
description: Diagnose RxJS 7 or RxJS 9 bugs involving missing or duplicate emissions, cancellation, teardown, Subjects, higher-order operators, scheduling, errors, multicasting, or reentrancy. Use for debugging rather than broad code review.
---

# Debug RxJS

Confirm the RxJS major and reproduce the smallest failing behavior.

Build a timeline containing subscription, source activation, inner activation,
each notification, cancellation, teardown, and restart. Read the chain both
ways: subscription setup travels upstream; notifications travel downstream.

Check these common fault lines:

- the wrong higher-order strategy for replacement, ordering, parallelism, or
  ignored triggers;
- `catchError`, retry, or repeat scoped at the wrong level;
- a hot/cold or shared/per-subscription assumption that does not match the
  chosen major and source type;
- synchronous reentrancy before closed state or teardown is visible;
- Subject terminal state or replay/current value behavior;
- scheduler/host-timer mismatch;
- unhandled errors, promise conversions waiting forever, or cancellation that
  reaches only part of the subscription tree.

Add one focused regression test before changing production code. Read the
[debugging playbook](references/debugging-playbook.md).
