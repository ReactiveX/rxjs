# Subscriptions, cancellation, and teardown

## Follow the Subscription owner

RxJS 7 cancellation is rooted in `Subscription` and `unsubscribe()`. Draw the
parent/child subscription tree, including higher-order inners, notifiers,
recovery streams, scheduled actions, and manually nested subscriptions. Mark
which public owner should release each listener, timer, request, socket, or
custom resource.

Instrument the resource's actual cancellation call. An observer receiving no
more values proves detachment, not that an uncancelable Promise or request
stopped.

Common partial-cancellation causes:

- a nested `subscribe` was not added to the owning Subscription;
- an outer was unsubscribed but an independently owned inner survived;
- a notifier completed instead of emitting the cancellation trigger;
- a framework cleanup closed the current subscription but an older pipeline
  remained;
- a custom Observable forgot to return or register its teardown; or
- `switchMap` detached observation but the resource did not support abort.

## Diagnose teardown failures

Log teardown entry/exit and resource state. RxJS can aggregate multiple thrown
teardowns into `UnsubscriptionError`; inspect every member rather than stopping
at the first message. Teardowns should be idempotent because ownership paths
can converge during errors and explicit cancellation.

After cancellation, deliberately settle callbacks and Promises. Confirm that
closed subscriptions do not deliver values and that late errors are handled as
intended. Heavy work continuing after closure is still a defect clue even when
the observer is silent.

For a leak, repeat start/stop cycles and compare active listener, timer,
request, and subscriber counts after quiescence. A resource spy usually gives a
faster and more deterministic regression than a heap snapshot.
