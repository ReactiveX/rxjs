<a name="0.0.0-prealpha.3"></a>
# 0.0.0-prealpha.3 (2015-09-11)


### chore

* chore(CHANGELOG): add updated changelog ([218f629](https://github.com/ReactiveX/RxJS/commit/218f629))
* chore(docs): automate documentation generation and deployment ([145e02b](https://github.com/ReactiveX/RxJS/commit/145e02b))
* chore(test): add macro performance tests for combineLatest ([f258fc1](https://github.com/ReactiveX/RxJS/commit/f258fc1))

### fix

* fix(root): use self as the root object when available ([0428a85](https://github.com/ReactiveX/RxJS/commit/0428a85))

### refactor

* refactor(operator): ensure build time parameter type safety for _subscribe, call ([88979a4](https://github.com/ReactiveX/RxJS/commit/88979a4))
* refactor(test): let macro perf test use range to create observables ([ca42a32](https://github.com/ReactiveX/RxJS/commit/ca42a32))

* 0.0.0-prealpha.3 ([651010f](https://github.com/ReactiveX/RxJS/commit/651010f))



<a name="0.0.0-prealpha.2"></a>
# 0.0.0-prealpha.2 (2015-09-11)


### chore

* chore(docs): add basic esdoc generation ([341475a](https://github.com/ReactiveX/RxJS/commit/341475a)), closes [#99](https://github.com/ReactiveX/RxJS/issues/99)
* chore(package.json): update name to all lowercase so npm loves me again ([c39a245](https://github.com/ReactiveX/RxJS/commit/c39a245))
* chore(perf): fix catch micro perf test ([d08fb68](https://github.com/ReactiveX/RxJS/commit/d08fb68)), closes [#283](https://github.com/ReactiveX/RxJS/issues/283)
* chore(perf): improve micro perf ergonomics ([fb21385](https://github.com/ReactiveX/RxJS/commit/fb21385))
* chore(test): add jasmine helpers for virtual time tests ([e892568](https://github.com/ReactiveX/RxJS/commit/e892568))
* chore(test): add macro performance tests for groupBy ([acd745e](https://github.com/ReactiveX/RxJS/commit/acd745e))
* chore(test): add macro performance tests for merge ([26661c8](https://github.com/ReactiveX/RxJS/commit/26661c8))
* chore(test): add macro performance tests for zip ([4e79536](https://github.com/ReactiveX/RxJS/commit/4e79536))
* chore(test): add micro-benchmark performance test for Observable.throw ([492f594](https://github.com/ReactiveX/RxJS/commit/492f594))
* chore(test): add micro-benchmark performance test for bufferCount operator ([621b1ea](https://github.com/ReactiveX/RxJS/commit/621b1ea))
* chore(test): add micro-benchmark performance test for catch operator ([bb66d4b](https://github.com/ReactiveX/RxJS/commit/bb66d4b))
* chore(test): add micro-benchmark performance test for groupby operator ([71841c9](https://github.com/ReactiveX/RxJS/commit/71841c9))
* chore(test): add micro-benchmark performance test for startwith operator ([2028a61](https://github.com/ReactiveX/RxJS/commit/2028a61))
* chore(test): add micro-benchmark performance test for windowCount operator ([c632d04](https://github.com/ReactiveX/RxJS/commit/c632d04))
* chore(test): add virtual time tests for `combineLatest` proto ([5e44716](https://github.com/ReactiveX/RxJS/commit/5e44716))

### docs

* docs(CONTRIBUTION): add the beginnings of contribution guidelines ([09b5320](https://github.com/ReactiveX/RxJS/commit/09b5320)), closes [#135](https://github.com/ReactiveX/RxJS/issues/135)
* docs(Observable): add basic documentation for Observable ([f9a36da](https://github.com/ReactiveX/RxJS/commit/f9a36da))
* docs(badges): add npm version badge ([97dc2f9](https://github.com/ReactiveX/RxJS/commit/97dc2f9))
* docs(npm): update npm name to be lowercase ([713fbc2](https://github.com/ReactiveX/RxJS/commit/713fbc2))
* docs(usage): add basic node.js usage information ([c206c7b](https://github.com/ReactiveX/RxJS/commit/c206c7b))

### feat

* feat(Observable): add static create method ([e0d27ba](https://github.com/ReactiveX/RxJS/commit/e0d27ba)), closes [#255](https://github.com/ReactiveX/RxJS/issues/255)
* feat(TestScheduler): add TestScheduler ([b23daf1](https://github.com/ReactiveX/RxJS/commit/b23daf1)), closes [#270](https://github.com/ReactiveX/RxJS/issues/270)
* feat(VirtualTimeScheduler): add VirtualTimeScheduler ([96f9386](https://github.com/ReactiveX/RxJS/commit/96f9386)), closes [#269](https://github.com/ReactiveX/RxJS/issues/269)
* feat(operator): add sample and sampleTime ([9e62789](https://github.com/ReactiveX/RxJS/commit/9e62789)), closes [#178](https://github.com/ReactiveX/RxJS/issues/178)

### fix

* fix(bufferCount): set default value for skip argument, do not emit empty buffer at the end ([2c1a9dc](https://github.com/ReactiveX/RxJS/commit/2c1a9dc))
* fix(windowCount): set default value for skip argument, do not emit empty buffer at the end ([a513dbb](https://github.com/ReactiveX/RxJS/commit/a513dbb))

### refactor

* refactor(Action): move delay setting to Action to support Virtual Time Scheduling ([af1cb68](https://github.com/ReactiveX/RxJS/commit/af1cb68))
* refactor(Observable): switch from @@observer to @@observable ([b97d290](https://github.com/ReactiveX/RxJS/commit/b97d290)), closes [#275](https://github.com/ReactiveX/RxJS/issues/275)
* refactor(Scalar): move to _isScalar from instanceof ScalarObservable ([1469e6a](https://github.com/ReactiveX/RxJS/commit/1469e6a)), closes [#276](https://github.com/ReactiveX/RxJS/issues/276)
* refactor(Scheduler): change order of arguments to schedule method ([e077230](https://github.com/ReactiveX/RxJS/commit/e077230)), closes [#265](https://github.com/ReactiveX/RxJS/issues/265)
* refactor(operators): ensure _subscribe is being called where possible ([d59a195](https://github.com/ReactiveX/RxJS/commit/d59a195)), closes [#290](https://github.com/ReactiveX/RxJS/issues/290)

* 0.0.0-prealpha.2 ([780a8b3](https://github.com/ReactiveX/RxJS/commit/780a8b3))



<a name="0.0.0-prealpha.1"></a>
# 0.0.0-prealpha.1 (2015-09-02)


### MERGE

* MERGE: Rebasing from `lift` which was also rebased upstream. ([1780e81](https://github.com/ReactiveX/RxJS/commit/1780e81))

### WIP

* WIP: makes unit tests working ([e58b654](https://github.com/ReactiveX/RxJS/commit/e58b654))

### bugfix

* bugfix(defer): Catch errors from Defer's observableFactory function. ([c0f8508](https://github.com/ReactiveX/RxJS/commit/c0f8508))
* bugfix(merge): Prevent MergeSubscriber from setting its _isUnsubscribed flag to true before its inne ([d2d5f1a](https://github.com/ReactiveX/RxJS/commit/d2d5f1a))
* bugfix(reduce): Pass the initial value to the ReduceOperator. ([5d4916b](https://github.com/ReactiveX/RxJS/commit/5d4916b))
* bugfix(zip): Remove usage of sparse array ([8c20e82](https://github.com/ReactiveX/RxJS/commit/8c20e82))

### chore

* chore(CompositeSubscription.ts): remove unused import ([4dccd0a](https://github.com/ReactiveX/RxJS/commit/4dccd0a))
* chore(build): add uglifyjs minification to global build. ([abe9a24](https://github.com/ReactiveX/RxJS/commit/abe9a24))
* chore(build): use typescript compiler for es5 build ([3f2977f](https://github.com/ReactiveX/RxJS/commit/3f2977f)), closes [#186](https://github.com/ReactiveX/RxJS/issues/186)
* chore(ci): set up Travis configuration ([e6d20cf](https://github.com/ReactiveX/RxJS/commit/e6d20cf)), closes [#91](https://github.com/ReactiveX/RxJS/issues/91)
* chore(dest): remove dist from repo and add prepublish script ([3cb9afa](https://github.com/ReactiveX/RxJS/commit/3cb9afa)), closes [#90](https://github.com/ReactiveX/RxJS/issues/90)
* chore(global): add Subscription constructor to global ([57cf298](https://github.com/ReactiveX/RxJS/commit/57cf298))
* chore(operator): fix API signatures for merge, concat, combineLatest and zip ([327dcd7](https://github.com/ReactiveX/RxJS/commit/327dcd7)), closes [#184](https://github.com/ReactiveX/RxJS/issues/184)
* chore(package): add benchpress dependencies and remove unused gulp dependencies ([fa06dd5](https://github.com/ReactiveX/RxJS/commit/fa06dd5))
* chore(package): improve global build to use loose mode ([ba72fe3](https://github.com/ReactiveX/RxJS/commit/ba72fe3))
* chore(test): add micro perf test for Observable.prototype.concat ([133d53c](https://github.com/ReactiveX/RxJS/commit/133d53c))
* chore(test): add micro-benchmark performance test for Observable.empty ([fb7590a](https://github.com/ReactiveX/RxJS/commit/fb7590a))
* chore(test): add micro-benchmark performance test for concatAll operator ([92acef6](https://github.com/ReactiveX/RxJS/commit/92acef6))
* chore(test): add micro-benchmark performance test for defaultIfEmpty operator ([522f0a8](https://github.com/ReactiveX/RxJS/commit/522f0a8))
* chore(test): add micro-benchmark performance test for repeat operator ([f64b81b](https://github.com/ReactiveX/RxJS/commit/f64b81b))
* chore(test): added take operator micro perf tests ([2239313](https://github.com/ReactiveX/RxJS/commit/2239313))
* chore(test): update micro-benchmark performance test for repeat operator ([03853ac](https://github.com/ReactiveX/RxJS/commit/03853ac))
* chore(tests): add tests for skip ([314c93f](https://github.com/ReactiveX/RxJS/commit/314c93f))
* chore(tests): update tests to have clean CJS requires ([8eb045e](https://github.com/ReactiveX/RxJS/commit/8eb045e))
* chore(tsd): update typings dependencies ([e58d861](https://github.com/ReactiveX/RxJS/commit/e58d861))
* chore: add code of conduct ([49ec8c3](https://github.com/ReactiveX/RxJS/commit/49ec8c3)), closes [#101](https://github.com/ReactiveX/RxJS/issues/101)

### feat

* feat(benchpress): add benchpress config and flatmap spec ([0441dea](https://github.com/ReactiveX/RxJS/commit/0441dea))
* feat(catch): add catch operator, related to #141, closes #130 ([94b4c01](https://github.com/ReactiveX/RxJS/commit/94b4c01)), closes [#130](https://github.com/ReactiveX/RxJS/issues/130)
* feat(from): let from handle any "observablesque" ([526d4c3](https://github.com/ReactiveX/RxJS/commit/526d4c3)), closes [#156](https://github.com/ReactiveX/RxJS/issues/156) [#236](https://github.com/ReactiveX/RxJS/issues/236)
* feat(index): add index module which requires commonjs build ([379d2d1](https://github.com/ReactiveX/RxJS/commit/379d2d1)), closes [#117](https://github.com/ReactiveX/RxJS/issues/117)
* feat(observable): add Observable.all (forkJoin) ([44a4ee1](https://github.com/ReactiveX/RxJS/commit/44a4ee1))
* feat(operator): Add count operator. ([30dd894](https://github.com/ReactiveX/RxJS/commit/30dd894))
* feat(operator): Add distinctUntilChanged and distinctUntilKeyChanged ([f9ba4da](https://github.com/ReactiveX/RxJS/commit/f9ba4da))
* feat(operator): Add do operator. ([7d9b52b](https://github.com/ReactiveX/RxJS/commit/7d9b52b))
* feat(operator): Add expand operator. ([47b178b](https://github.com/ReactiveX/RxJS/commit/47b178b))
* feat(operator): Add minimal delay operator. ([7851885](https://github.com/ReactiveX/RxJS/commit/7851885))
* feat(operator): add buffer operators: buffer, bufferWhen, bufferTime, bufferCount, and bufferToggle ([9f8347f](https://github.com/ReactiveX/RxJS/commit/9f8347f)), closes [#207](https://github.com/ReactiveX/RxJS/issues/207)
* feat(operator): add debounce ([f03adaf](https://github.com/ReactiveX/RxJS/commit/f03adaf)), closes [#193](https://github.com/ReactiveX/RxJS/issues/193)
* feat(operator): add defaultIfEmpty ([c80688b](https://github.com/ReactiveX/RxJS/commit/c80688b))
* feat(operator): add finally ([526e4c9](https://github.com/ReactiveX/RxJS/commit/526e4c9))
* feat(operator): add fromEventPattern creator function ([1095d4c](https://github.com/ReactiveX/RxJS/commit/1095d4c))
* feat(operator): add groupBy ([1e13aea](https://github.com/ReactiveX/RxJS/commit/1e13aea)), closes [#165](https://github.com/ReactiveX/RxJS/issues/165)
* feat(operator): add materialize. closes #132 ([6d9f6ae](https://github.com/ReactiveX/RxJS/commit/6d9f6ae)), closes [#132](https://github.com/ReactiveX/RxJS/issues/132)
* feat(operator): add publishBehavior operator and spec ([249ab8d](https://github.com/ReactiveX/RxJS/commit/249ab8d))
* feat(operator): add publishReplay operator and spec ([a0c47d6](https://github.com/ReactiveX/RxJS/commit/a0c47d6))
* feat(operator): add retry ([4451db5](https://github.com/ReactiveX/RxJS/commit/4451db5))
* feat(operator): add retryWhen operator. closes #129 ([65eb50e](https://github.com/ReactiveX/RxJS/commit/65eb50e)), closes [#129](https://github.com/ReactiveX/RxJS/issues/129)
* feat(operator): add skipUntil ([ef2620e](https://github.com/ReactiveX/RxJS/commit/ef2620e)), closes [#180](https://github.com/ReactiveX/RxJS/issues/180)
* feat(operator): add throttle ([1d735b9](https://github.com/ReactiveX/RxJS/commit/1d735b9)), closes [#191](https://github.com/ReactiveX/RxJS/issues/191)
* feat(operator): add timeout and timeoutWith ([bb440ad](https://github.com/ReactiveX/RxJS/commit/bb440ad)), closes [#244](https://github.com/ReactiveX/RxJS/issues/244)
* feat(operator): add toPromise operator. closes #159 ([361a53b](https://github.com/ReactiveX/RxJS/commit/361a53b)), closes [#159](https://github.com/ReactiveX/RxJS/issues/159)
* feat(operator): add window operators: window, windowWhen, windowTime, windowCount, windowToggle ([9f5d510](https://github.com/ReactiveX/RxJS/commit/9f5d510)), closes [#195](https://github.com/ReactiveX/RxJS/issues/195)
* feat(operator): add withLatestFrom ([322218a](https://github.com/ReactiveX/RxJS/commit/322218a)), closes [#209](https://github.com/ReactiveX/RxJS/issues/209)
* feat(operator): implement startWith(). ([1f36d99](https://github.com/ReactiveX/RxJS/commit/1f36d99))

### fix

* fix(combineLatest): check for limits higher than total observable count ([81e5dfb](https://github.com/ReactiveX/RxJS/commit/81e5dfb))
* fix(rx): add hack to export global until better global build exists ([1a543b0](https://github.com/ReactiveX/RxJS/commit/1a543b0))
* fix(subscription-ref): add setter for isDisposed ([6fe5427](https://github.com/ReactiveX/RxJS/commit/6fe5427))
* fix(take): complete on limit reached ([801a711](https://github.com/ReactiveX/RxJS/commit/801a711))

### refactor

* refactor(Scheduler): remove circular reference to make Babel happy on Travis ([6d48c1e](https://github.com/ReactiveX/RxJS/commit/6d48c1e))
* refactor(Subscriber): make Observer an interface, inherit from Subscription ([623edf7](https://github.com/ReactiveX/RxJS/commit/623edf7)), closes [#224](https://github.com/ReactiveX/RxJS/issues/224)
* refactor(cjs): update build to support proper CJS output for node ([566a7dc](https://github.com/ReactiveX/RxJS/commit/566a7dc)), closes [#248](https://github.com/ReactiveX/RxJS/issues/248)
* refactor(observeOn): let observeOn uses notification instead of custom implementation ([d86f276](https://github.com/ReactiveX/RxJS/commit/d86f276))
* refactor(observeOn): move observeOn support classes to own file for sharing ([8a99ae1](https://github.com/ReactiveX/RxJS/commit/8a99ae1))
* refactor(of): of(1) returns a ScalarObservable, just, value, return removed ([c8fdda4](https://github.com/ReactiveX/RxJS/commit/c8fdda4)), closes [#232](https://github.com/ReactiveX/RxJS/issues/232)
* refactor(operator): change operator class to interface ([92abb6d](https://github.com/ReactiveX/RxJS/commit/92abb6d))
* refactor(retry): change extends Operator to implements Operator ([d565115](https://github.com/ReactiveX/RxJS/commit/d565115))
* refactor(timeout): have timeout and timeoutWith reference proper schedulers ([9f0f92c](https://github.com/ReactiveX/RxJS/commit/9f0f92c))

### test

* test(flatMap): add variables for number of iterations with flatMap benchmark ([3e1c96a](https://github.com/ReactiveX/RxJS/commit/3e1c96a))
* test(fromPromise): fix cancellation spec ([fd57731](https://github.com/ReactiveX/RxJS/commit/fd57731))
* test(interval): fix timing and expectations of interval spec ([2a3887a](https://github.com/ReactiveX/RxJS/commit/2a3887a))
* test(observable): call done in return function of observer ([b1b6330](https://github.com/ReactiveX/RxJS/commit/b1b6330))
* test(retryWhen): update test to account for corrected take behavior ([65257fe](https://github.com/ReactiveX/RxJS/commit/65257fe))
* test(timer): use jasmine clock in Observable.timer spec ([3b730bd](https://github.com/ReactiveX/RxJS/commit/3b730bd))
* test: add test helper to reduce timeout and fail tests faster. ([dc7afeb](https://github.com/ReactiveX/RxJS/commit/dc7afeb))


