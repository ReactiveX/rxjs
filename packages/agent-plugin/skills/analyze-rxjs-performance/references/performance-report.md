# Performance report template

## Scenario

- RxJS major and exact version:
- runtime/browser/hardware:
- build mode and flags:
- source rate/value shape/observer count:
- duration, warmup, samples:
- correctness oracle:

## Baseline

- primary metric, median, spread/percentiles:
- CPU/trace evidence:
- allocation/heap evidence:
- active work/backlog evidence:
- producer/subscription/teardown counts:
- bundle/module graph when relevant:

## Hypothesis

State the exact mechanism and predicted measurable change.

## Change

Describe code/policy changed and any lifecycle semantics explicitly approved.

## Result

- same primary metric and sampling method:
- regression/noise:
- memory after identical teardown/quiescence:
- correctness/lifecycle tests:
- confidence and remaining uncertainty:

Attach or link raw profiles and commands. Do not report only a percentage
without absolute values and scenario.
