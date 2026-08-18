# Memory leak investigation

## Reproduce retained growth

Use a loop that mounts/starts the owner, exercises representative work,
unmounts/stops it, settles cancellation, and returns to quiescence. Track heap
across multiple cycles; distinguish high-water allocation from monotonically
retained growth.

## Inspect dominators and retaining paths

Common RxJS-related roots include:

- terminal subscription still owned by a component/service;
- event listener or host callback retaining a subscriber closure;
- Subject retaining observers;
- replay/current state retaining a large value graph;
- higher-order queue retaining inputs;
- in-flight Promise/async function retaining local state;
- retry/repeat timer retaining the pipeline; and
- framework cache/singleton retaining the Observable itself.

Trace to the first application-owned edge that should have been released.

## Confirm cleanup behavior

RxJS 7: unsubscribe the owning Subscription and assert returned/registered
teardown. RxJS 9: abort the owner signal; for a platform source ensure all
observers are gone; assert the actual resource teardown.

Completion is not a substitute for owner cancellation when the source may
never complete. `take(1)` can remain pending forever on a silent source.

## Replay and caches

Record buffer size, time window, reset rules, source lifetime, and value graph.
Use smaller retained representations when callers do not need the full object,
but do not mutate/reuse emitted objects that observers may hold.

## Prove the fix

Compare heap after the same number of cycles and same quiescence procedure.
Add a lifecycle regression test with a teardown/listener/subscriber count. A
heap improvement without resource correctness is incomplete evidence.
