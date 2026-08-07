# Schedulers and testing migration

RxJS 9 does not publish the RxJS 7 general scheduler system or scheduler
arguments. Runtime timing uses host timers, animation frames, microtasks, and
narrow providers where documented.

## Scheduler arguments are semantic work

Before removing a scheduler argument, characterize:

- synchronous versus deferred delivery;
- ordering relative to microtasks, timers, rendering, and other streams;
- cancellation before scheduled work runs;
- recursive scheduling/stack behavior;
- error timing; and
- test-only versus production dependency.

The migration engine refuses scheduler-bearing forms outside its proved
contract. Do not strip the argument and call the result equivalent.

## Migrate tests to `@rxjs/test`

Use `cold()` as the RxJS 7 behavior-preserving default. Choose another source
model only when the old test proves it:

- `cold()` — independent producer work per subscription;
- `hot()` — Subject-like absolute-timeline producer that exists before
  observers; or
- `observable()` — platform shared/ref-counted active producer lifecycle.

The source model is part of the behavioral claim. Converting every old cold
marble to `observable()` changes producer multiplicity; retaining every test as
`cold()` can hide intended platform sharing.

## Test more than values

Preserve or add assertions for subscription windows, cancellation, teardown,
late joins, restart, errors, completion, and active inner counts. Use direct
resource spies when marble timing cannot prove cleanup or reentrant terminal
order.

## TestScheduler migration

The engine defaults supported TestScheduler transformations to cold mode.
Platform mode remains explicit and refuses ambiguous multiple-observation or
mixed-setup cases. Treat that refusal as a request for lifecycle evidence, not
as a reason to change the marble source silently.

Use only deterministic local tests as release gates. Do not invoke model-
backed, credit-consuming, or authenticated agent evaluations.
