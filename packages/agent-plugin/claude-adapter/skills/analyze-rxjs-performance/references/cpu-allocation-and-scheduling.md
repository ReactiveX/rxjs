# CPU, allocation, and scheduling

## Profile before fusing operators

Adjacent synchronous callbacks create call and allocation overhead, but that
is rarely the first bottleneck. Confirm the stack/sample lane is hot and the
work is not dominated by I/O, rendering, parsing, or GC.

Collapsing operators can change user-callback error boundaries, indices,
type narrowing, cancellation checks, reentrancy, and readability. Only fuse a
proven hot path with an equivalence test.

## Reduce redundant work at the source

Prefer eliminating unnecessary production or downstream work:

- `distinctUntilChanged` with a correct comparator before expensive work;
- debounce/coalescing when intermediate inputs have no value;
- one domain calculation reused by consumers;
- bounded concurrency;
- stable pipeline identity; and
- moving expensive transformations after a selective filter when semantics
  allow.

Do not add `distinctUntilChanged` around mutable object identity and expect it
to detect semantic equality.

## Allocation pressure

Look for per-value arrays/objects, closures, regex/parsers, materialization,
group/window buffers, replay histories, and logging snapshots. Retained
allocation and short-lived allocation are different problems; use allocation
profiles and heap snapshots accordingly.

Avoid object pooling without proof. Reuse can introduce mutation/reentrancy
bugs when observers retain values.

## Scheduling and latency

Every async boundary changes batching, fairness, error timing, and teardown.
Measure queue delay separately from work time. In RxJS 7, scheduler choices may
be explicit. In RxJS 9, host timers/microtasks/animation frames are the
relevant queues.

Removing a scheduling boundary may improve throughput while breaking UI
responsiveness or stack safety. Adding one may reduce jank while increasing
latency and allocation. Preserve the actual product constraint.
