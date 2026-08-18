# RxJS 7 review testing evidence

A value assertion proves only delivered values in one execution. Match the
test to the finding.

## Require the right evidence

- **Ownership/leak:** teardown spy and explicit owner unsubscription.
- **Replacement:** overlapping inner subscription windows and canceled old
  work.
- **Queueing:** order, maximum active count, and pending-work behavior.
- **Ignoring:** triggers during active work are deliberately absent.
- **Recovery scope:** one failure followed by a later successful trigger.
- **Retry:** subscription count, delay, final error, and cancellation in delay.
- **Sharing:** source subscription count, late subscriber, zero-ref-count
  disconnect, error reset, and completion reset.
- **Subject state:** late observer, reentrant update, and terminal state.
- **Custom source/operator:** next/error/complete, explicit unsubscribe,
  callback throw, synchronous setup, and reentrancy.
- **Promise conversion:** qualifying value, empty completion, source error,
  timeout/cancellation, and non-completing source.

Marble tests are strong for notification timing and subscription windows.
Direct tests with resource spies are clearer for teardown, observer callback
errors, and synchronous reentrancy. Use both when both are part of the
contract.

Do not accept “the test passes” without checking that the test selects the
relevant source shape and terminal path. A cold marble source does not prove
behavior for a shared Subject, and a naturally completing source does not
prove owner unsubscription.
