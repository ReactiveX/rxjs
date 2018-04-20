<img src="doc/asset/Rx_Logo_S.png" alt="RxJS Logo" width="86" height="86"> RxJS: Reactive Extensions For JavaScript
======================================

This is an EXPERIMENTAL BRANCH OF RXJS... DO NOT USE IN PRODUCTION UNLESS YOU'RE COMPLETELY NUTS. NOTHING IN THIS BRANCH IS EVEN CLOSE TO STABLE OR EVEN ACCURATE. 

## This is an experiment.

Remaining to do:

- [ ] Setup CI (Travis, etc)
- [ ] Develop a build process (nothing builds currently this has been spiked in Stackblitz mostly)
  - [ ] Build ESM
  - [ ] Build CJS
  - [ ] Build UMD
- [ ] Redevelop the TestScheduler with the new methodology
- [X] Add (at least some) tests so we have a testing process
- [ ] Port all types and operators
- [ ] Add perf tests vs RxJS 5.5/6
- [ ] Add typings tests
- [ ] Chart deprecation paths for v6


### What is this?

This is an experimental design of RxJS loosely based on Andre Staltz's [callbags](https://github.com/staltz/callbag-basics). With a few big changes:

1. Support for 3 communication channels (next, error and completion)
2. Support for teardown/unsubscription
3. Support for scheduling

These things are all a must for RxJS.

The overall idea is to implement these changes with as few breaking changes to RxJS as possible.


