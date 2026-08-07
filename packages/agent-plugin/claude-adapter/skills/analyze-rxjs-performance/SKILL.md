---
name: analyze-rxjs-performance
description: Measure and improve RxJS 7 or RxJS 9 CPU, throughput, latency, allocation, memory retention, subscription churn, concurrency/backlog, and bundle cost while preserving values, order, errors, completion, cancellation, sharing, and teardown. Use for profiling, leaks, slow pipelines, excess requests, event storms, heap growth, or benchmark questions; do not infer bottlenecks from operator names alone.
---

# Analyze RxJS performance

Identify the RxJS major and define the workload before proposing a fix:
source/consumer rates, observer count, value shapes, runtime, warmup, duration,
and correctness guardrail.

Use this sequence:

1. Reproduce under a representative workload and save a baseline profile,
   benchmark, heap snapshot, trace, or bundle graph.
2. Map producer activations, subscriptions/observers, higher-order children,
   scheduled work, queues, replay buffers, and retained closures.
3. Classify the cost as CPU, allocation/GC, latency/scheduling, I/O,
   concurrency/backlog, memory retention, subscription churn, or bundle bytes.
4. Form one falsifiable hypothesis tied to evidence. Change one policy at a
   time and preserve lifecycle semantics unless the owner approves a change.
5. Re-run the same measurement and tests. Report median/spread, memory after
   quiescence/teardown, regressions, and uncertainty—not only the best sample.

```ts
// Bad diagnosis: "mergeMap is slow."
// Useful diagnosis: input peaks at 8k/s, active requests reach 1,900, and the
// pending queue retains 140 MB because concurrency/backlog are unbounded.
```

## Load references by performance lane

- Use [measurement workflow](references/measurement-workflow.md) for baselines,
  hypotheses, controls, and reporting.
- Use [subscription work and retention](references/subscription-work-and-retention.md)
  for producer duplication, churn, sharing, replay, and retained owners.
- Use [concurrency and backlog](references/concurrency-and-backlog.md) for active
  work, queues, replacement, dropping, backpressure, and cancellation.
- Use [CPU, allocation, and scheduling](references/cpu-allocation-and-scheduling.md)
  for synchronous hot paths, object churn, callback layers, and latency.
- Use [memory leak investigation](references/memory-leak-investigation.md) for
  heap snapshots, dominators, teardown, and false positives.
- Use [optimization patterns](references/optimization-patterns.md) for
  behavior-preserving candidate fixes with good/bad code.
- Use [performance report template](references/performance-report.md) to hand
  off reproducible evidence.

Hand bundle-only work to `optimize-rxjs-bundles`, correctness diagnosis to
`debug-rxjs`, and code rewrites to the matching version authoring skill.
