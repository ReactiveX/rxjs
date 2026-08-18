# Subscription work and retention

## Count producer activations

Instrumentation should distinguish:

- Observable instance creation;
- observer subscription;
- underlying producer activation;
- higher-order inner activation;
- retry/repeat reactivation; and
- teardown/release.

In RxJS 7, a normal cold Observable usually activates once per subscription;
`share` can coordinate subscribers. In RxJS 9, one platform Observable shares
its active producer among concurrent observers, while `ColdObservable`
activates per direct subscription. Comparing observer count with producer count
without the correct major/lifecycle produces false diagnoses.

## Look for churn

Common churn sources:

- creating pipelines in render/change-detection loops;
- unstable framework dependencies resubscribing effects;
- subscribe/unsubscribe around every event;
- retry loops on synchronous failure;
- duplicated package copies with separate Symbol identities or caches; and
- domain helpers that subscribe internally.

Use stable Observable identity at the lifetime owner. Do not make a global
singleton merely to reduce counts; that changes ownership and retention.

## Inspect retention roots

Replay buffers, Subjects, queued higher-order values, event listeners,
closures, caches, and terminal subscriptions can retain large graphs. In a
heap snapshot, follow retaining paths from a dominator to the application
owner and identify the missing release/reset condition.

`shareReplay` is not automatically a leak. It is a leak/risk when retained
values or source work outlive the intended owner or have no bounded reset.

## Check after teardown

Abort/unsubscribe the owner, settle or cancel work, remove references, allow
the runtime to quiesce, and compare multiple heap snapshots. One snapshot while
work is legitimately active cannot prove a leak.

For RxJS 9 platform sources, remove the final observer before expecting
producer cleanup. Removing one of several observers should not close shared
work.
