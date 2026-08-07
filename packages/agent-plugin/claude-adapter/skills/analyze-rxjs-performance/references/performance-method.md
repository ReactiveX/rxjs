# Performance method

## Measurement lanes

- CPU/throughput: representative values, warmup, stable runtime, repeated
  samples, median and spread.
- Latency/scheduling: timestamps around the actual host or scheduler boundary.
- Allocation/retention: allocation profile plus heap snapshots after teardown
  and forced quiescence where supported.
- Backlog: source rate, active inner count, queue/buffer size, and drop policy.
- Bundle: one bundler/config/target with minified, gzip, Brotli, and module graph.

## Common causes

Unintended resubscription, rebuilding pipelines in render loops, unbounded
merge/concat work, replay caches without reset, never-ending promise
conversions, closures retaining owners, duplicate package copies, and excessive
synchronous operator layering in a proven hot path.

## Acceptance

Keep a correctness oracle for emissions, order, errors, completion,
cancellation, sharing, and teardown. Compare like-for-like measurements and
report regressions or noise. Never recommend a semantic lifecycle change as a
performance optimization without explicit approval.
