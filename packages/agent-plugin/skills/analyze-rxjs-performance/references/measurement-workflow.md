# Performance measurement workflow

## Define the question

Choose one primary outcome:

- values processed per second;
- end-to-end or stage latency;
- active I/O and pending backlog;
- allocations or GC pause;
- retained heap after owner teardown;
- producer/subscription count; or
- shipped bytes and startup execution.

Record RxJS major, runtime/browser, hardware, build mode, source rate, observer
count, dataset/value shape, run duration, warmup, and external dependencies.

## Keep a correctness oracle

Before optimizing, capture values, order, errors, completion, cancellation,
sharing, restart, and teardown that must remain. A faster pipeline that drops a
required value or changes producer multiplicity is a behavior change, not an
optimization.

## Measure like for like

- Build in the same mode and target.
- Warm JIT and caches consistently.
- Run multiple samples; report median and spread/percentiles.
- Keep source/consumer pressure identical.
- Separate setup from steady state unless setup is the problem.
- Include a control or empty/root entry for shared overhead.
- Quiesce and release owners before comparing retained memory.

## Form a falsifiable hypothesis

Bad: “RxJS overhead is high.”

Good: “Each render creates a new shared pipeline; 600 renders produce 600
source subscriptions and retain 600 replay buffers. Moving pipeline creation
to the stable owner should keep one subscription and one bounded buffer.”

Predict the observable change before editing, then verify it in the trace and
correctness tests.

## Report uncertainty

Include raw scenario, sample count, median/range or percentiles, before/after
module/heap evidence, and any regression. Do not present one favorable run as
a reliable speedup.
