# RxJS 9 testing patterns

Use `@rxjs/test` to virtualize host timers and clocks across both RxJS work and
ordinary application work in the same realm.

Test the selected source model explicitly:

- cold: independent producer per direct subscription;
- hot: producer exists before subscription;
- platform: one shared/ref-counted active producer.

When lifecycle matters, assert join time, individual observer abort, final
observer abort, teardown order, and restart. Early terminal operators should
prove synchronous upstream cancellation before avoidable work continues.
Errors thrown by downstream observers follow host-reporting rules and should
not be confused with source error notifications.

Run shared platform contracts against the packaged fallback and a supported
native Observable. A passing unit test is not a WPT conformance claim.
