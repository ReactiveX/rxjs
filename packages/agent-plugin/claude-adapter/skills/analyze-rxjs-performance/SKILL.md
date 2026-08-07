---
name: analyze-rxjs-performance
description: Analyze RxJS 7 or RxJS 9 performance using measurements, subscription-tree reasoning, allocation and retention review, concurrency/backlog analysis, bundle evidence, and safe optimization suggestions. Use for profiling, leaks, throughput, latency, or memory questions involving RxJS.
---

# Analyze RxJS Performance

Identify the RxJS major first. Define the measured workload, environment,
source rate, consumer rate, observer count, warmup, and correctness guardrail.

1. Capture a baseline with the project's profiler, benchmark, heap snapshot, or
   bundle stats. Do not infer a bottleneck from operator names alone.
2. Map active subscriptions and retained child paths. Look for unintended
   resubscription, unbounded concurrency/queues, replay retention, closures
   holding large graphs, and consumption boundaries that never terminate.
3. Separate CPU/call-stack layering, allocation, scheduling, I/O, backlog,
   bundle size, and memory retention; they need different fixes.
4. Suggest the smallest change that preserves emissions, ordering,
   cancellation, error/completion, sharing, and teardown.
5. Re-run the same measurement and lifecycle tests. Report uncertainty and
   regressions, not only the best number.

Adjacent synchronous operators may be collapsed only in a proven hot path and
only when readability and semantics stay clear. Read the
[performance method](references/performance-method.md) before proposing a fix.
