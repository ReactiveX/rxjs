<a name="5.0.0-alpha.7"></a>
# [5.0.0-alpha.7](https://github.com/ReactiveX/RxJS/compare/5.0.0-alpha.6...v5.0.0-alpha.7) (2015-10-27)


### Bug Fixes

* **NextTickAction:** fix unsubscription behavior ([3d8264c](https://github.com/ReactiveX/RxJS/commit/3d8264c)), closes [#582](https://github.com/ReactiveX/RxJS/issues/582)
* **buffer:** cleanup notifier subscription when unsubscribed ([1b30aa9](https://github.com/ReactiveX/RxJS/commit/1b30aa9))
* **delay:** accepts absolute time delay ([b109100](https://github.com/ReactiveX/RxJS/commit/b109100))
* **mergeMapTo:** mergeMapTo result should complete ([6f9859e](https://github.com/ReactiveX/RxJS/commit/6f9859e))
* **operator:** update type definitions for union types ([9d90c75](https://github.com/ReactiveX/RxJS/commit/9d90c75)), closes [#581](https://github.com/ReactiveX/RxJS/issues/581)
* **repeat:** fix inner subscription semantics for repeat ([f67a596](https://github.com/ReactiveX/RxJS/commit/f67a596)), closes [#554](https://github.com/ReactiveX/RxJS/issues/554)
* **switchMapTo:** reimplement switchMapTo to pass tests ([d4789cd](https://github.com/ReactiveX/RxJS/commit/d4789cd))
* **takeUntil:** unsubscribe notifier when it completes ([9415196](https://github.com/ReactiveX/RxJS/commit/9415196))

### Features

* **operator:** add max operator ([7fda036](https://github.com/ReactiveX/RxJS/commit/7fda036))
* **operator:** add min operator ([79cb6cf](https://github.com/ReactiveX/RxJS/commit/79cb6cf))
* **shareBehavior:** add shareBehavior and its tests ([97ff1ec](https://github.com/ReactiveX/RxJS/commit/97ff1ec))



<a name="5.0.0-alpha.6"></a>
# [5.0.0-alpha.6](https://github.com/ReactiveX/RxJS/compare/5.0.0-alpha.6...v5.0.0-alpha.6) (2015-10-27)


### Bug Fixes

* **NextTickAction:** fix unsubscription behavior ([3d8264c](https://github.com/ReactiveX/RxJS/commit/3d8264c)), closes [#582](https://github.com/ReactiveX/RxJS/issues/582)
* **buffer:** cleanup notifier subscription when unsubscribed ([1b30aa9](https://github.com/ReactiveX/RxJS/commit/1b30aa9))
* **delay:** accepts absolute time delay ([b109100](https://github.com/ReactiveX/RxJS/commit/b109100))
* **mergeMapTo:** mergeMapTo result should complete ([6f9859e](https://github.com/ReactiveX/RxJS/commit/6f9859e))
* **operator:** update type definitions for union types ([9d90c75](https://github.com/ReactiveX/RxJS/commit/9d90c75)), closes [#581](https://github.com/ReactiveX/RxJS/issues/581)
* **repeat:** fix inner subscription semantics for repeat ([f67a596](https://github.com/ReactiveX/RxJS/commit/f67a596)), closes [#554](https://github.com/ReactiveX/RxJS/issues/554)
* **switchMapTo:** reimplement switchMapTo to pass tests ([d4789cd](https://github.com/ReactiveX/RxJS/commit/d4789cd))
* **takeUntil:** unsubscribe notifier when it completes ([9415196](https://github.com/ReactiveX/RxJS/commit/9415196))

### Features

* **operator:** add max operator ([7fda036](https://github.com/ReactiveX/RxJS/commit/7fda036))
* **operator:** add min operator ([79cb6cf](https://github.com/ReactiveX/RxJS/commit/79cb6cf))
* **shareBehavior:** add shareBehavior and its tests ([97ff1ec](https://github.com/ReactiveX/RxJS/commit/97ff1ec))



<a name="5.0.0-alpha.6"></a>
# [5.0.0-alpha.6](https://github.com/ReactiveX/RxJS/compare/5.0.0-alpha.5...v5.0.0-alpha.6) (2015-10-17)


### Bug Fixes

* **retryWhen:** fix internal unsubscriptions ([5aff5e8](https://github.com/ReactiveX/RxJS/commit/5aff5e8))
* **scan:** scan now behaves like RxJS 4 scan ([27f9c09](https://github.com/ReactiveX/RxJS/commit/27f9c09))



<a name="5.0.0-alpha.5"></a>
# [5.0.0-alpha.5](https://github.com/ReactiveX/RxJS/compare/5.0.0-alpha.4...v5.0.0-alpha.5) (2015-10-16)


### Bug Fixes

* **bufferToggle:** fix bugs in order to pass tests ([949fa31](https://github.com/ReactiveX/RxJS/commit/949fa31))
* **mergeAll:** fix mergeAll micro performance tests to use mapTo instead of map. ([616e86e](https://github.com/ReactiveX/RxJS/commit/616e86e))
* **package:** correct typings path ([a501b06](https://github.com/ReactiveX/RxJS/commit/a501b06))
* **repeat:** add additional resubscription behavior ([4f9f33b](https://github.com/ReactiveX/RxJS/commit/4f9f33b)), closes [#516](https://github.com/ReactiveX/RxJS/issues/516)
* **retry:** fix internal unsubscriptions for retry ([cc92f45](https://github.com/ReactiveX/RxJS/commit/cc92f45)), closes [#546](https://github.com/ReactiveX/RxJS/issues/546)
* **windowToggle:** fix window closing and unsubscription semantics ([0cb21e6](https://github.com/ReactiveX/RxJS/commit/0cb21e6))



<a name="5.0.0-alpha.4"></a>
# [5.0.0-alpha.4](https://github.com/ReactiveX/RxJS/compare/5.0.0-alpha.3...5.0.0-alpha.4) (2015-10-15)


### Bug Fixes

* **Subject:** fix missing unsubscribe call ([9dd27d6](https://github.com/ReactiveX/RxJS/commit/9dd27d6))
* **Subscriber:** avoid implicit any ([08faaa9](https://github.com/ReactiveX/RxJS/commit/08faaa9))
* **bufferWhen:** onComplete of closings determine buffers ([5d28a38](https://github.com/ReactiveX/RxJS/commit/5d28a38))
* **fromEvent:** make selector argument optional in fromEvent static method ([71d90b4](https://github.com/ReactiveX/RxJS/commit/71d90b4))
* **skipUntil:** update skipUntil behavior with error, completion ([6f0d98f](https://github.com/ReactiveX/RxJS/commit/6f0d98f)), closes [#518](https://github.com/ReactiveX/RxJS/issues/518)
* **windowCount:** fix windowCount window opening times ([908ae56](https://github.com/ReactiveX/RxJS/commit/908ae56)), closes [#273](https://github.com/ReactiveX/RxJS/issues/273)

### Features

* **operator:** add debounce operator ([a1e652f](https://github.com/ReactiveX/RxJS/commit/a1e652f)), closes [#493](https://github.com/ReactiveX/RxJS/issues/493)
* **operator:** add debounceTime operator ([dd2ba40](https://github.com/ReactiveX/RxJS/commit/dd2ba40))

### Performance Improvements

* **ScalarObservable:** add fast-path for mapping scalar observables ([7b0d3dc](https://github.com/ReactiveX/RxJS/commit/7b0d3dc))
* **count:** fast-path for counting over scalars ([c35a120](https://github.com/ReactiveX/RxJS/commit/c35a120))
* **filter:** add fast-path for filtering scalar observables ([e2e8954](https://github.com/ReactiveX/RxJS/commit/e2e8954))
* **reduce:** add fast-path for reducing over scalar observables ([4c65136](https://github.com/ReactiveX/RxJS/commit/4c65136))
* **scan:** fast-path for scanning scalars ([0201b92](https://github.com/ReactiveX/RxJS/commit/0201b92))
* **skip:** fast-path for skip over scalar observable ([9b49936](https://github.com/ReactiveX/RxJS/commit/9b49936))
* **take:** add fast-path for take over scalars ([33053b1](https://github.com/ReactiveX/RxJS/commit/33053b1))



<a name="5.0.0-alpha.3"></a>
# [5.0.0-alpha.3](https://github.com/ReactiveX/RxJS/compare/5.0.0-alpha.2...5.0.0-alpha.3) (2015-10-13)


### Bug Fixes

* **Observable:** fix type signature of some static operators ([e5364de](https://github.com/ReactiveX/RxJS/commit/e5364de))
* **Subject.create:** ensure operator property not required for Observable subscription ([2259de2](https://github.com/ReactiveX/RxJS/commit/2259de2)), closes [#483](https://github.com/ReactiveX/RxJS/issues/483)
* **TestScheduler:** stop sorting actual results ([51db0b8](https://github.com/ReactiveX/RxJS/commit/51db0b8)), closes [#422](https://github.com/ReactiveX/RxJS/issues/422)
* **benchpress:** update benchpress dependencies and config ([8513eaa](https://github.com/ReactiveX/RxJS/commit/8513eaa)), closes [#348](https://github.com/ReactiveX/RxJS/issues/348)
* **buffer:** change behavior of buffer to more closely match RxJS 4 ([b66592d](https://github.com/ReactiveX/RxJS/commit/b66592d))
* **combineLatest:** fix type signature ([a3e6deb](https://github.com/ReactiveX/RxJS/commit/a3e6deb))
* **defer:** fix type signature ([11327b9](https://github.com/ReactiveX/RxJS/commit/11327b9))
* **empty:** fix type signature ([893cb7e](https://github.com/ReactiveX/RxJS/commit/893cb7e))
* **fromPromise:** fix type signature ([17415fa](https://github.com/ReactiveX/RxJS/commit/17415fa))
* **groupBy:** durationSelector cannot keep source alive ([57e4207](https://github.com/ReactiveX/RxJS/commit/57e4207))
* **groupBy:** fix bugs related to group resets ([23a7574](https://github.com/ReactiveX/RxJS/commit/23a7574))
* **groupBy:** fix bugs with groupBy ([86992c6](https://github.com/ReactiveX/RxJS/commit/86992c6))
* **interval:** fix signature type ([9c238c0](https://github.com/ReactiveX/RxJS/commit/9c238c0))
* **operator:** startWith operator accepts scheduler, multiple values ([d1d339a](https://github.com/ReactiveX/RxJS/commit/d1d339a))
* **operators:** reorder signature of resultSelectors ([fc1724d](https://github.com/ReactiveX/RxJS/commit/fc1724d))
* **range:** fix type signature ([9237d0b](https://github.com/ReactiveX/RxJS/commit/9237d0b))
* **timeout:** fix absolute timeout behavior ([8ec06cf](https://github.com/ReactiveX/RxJS/commit/8ec06cf))
* **timeout:** update behavior of timeout, timeoutWith ([16bd691](https://github.com/ReactiveX/RxJS/commit/16bd691))
* **timer:** fix type signature ([fffb96c](https://github.com/ReactiveX/RxJS/commit/fffb96c))
* **window:** handle closingNotifier errors/completes ([42beff1](https://github.com/ReactiveX/RxJS/commit/42beff1))

### Features

* **TestScheduler:** support unsubscription marbles ([ffb0bb9](https://github.com/ReactiveX/RxJS/commit/ffb0bb9))
* **count:** add predicate support in count() ([42d1add](https://github.com/ReactiveX/RxJS/commit/42d1add)), closes [#425](https://github.com/ReactiveX/RxJS/issues/425)
* **dematerialize:** add dematerialize operator ([0a8b074](https://github.com/ReactiveX/RxJS/commit/0a8b074)), closes [#475](https://github.com/ReactiveX/RxJS/issues/475)
* **do:** do will now handle an observer as an argument ([c1a4994](https://github.com/ReactiveX/RxJS/commit/c1a4994)), closes [#476](https://github.com/ReactiveX/RxJS/issues/476)
* **first:** add resultSelector ([3c20fcc](https://github.com/ReactiveX/RxJS/commit/3c20fcc)), closes [#417](https://github.com/ReactiveX/RxJS/issues/417)
* **last:** add resultSelector argument ([5a4896c](https://github.com/ReactiveX/RxJS/commit/5a4896c)), closes [#418](https://github.com/ReactiveX/RxJS/issues/418)
* **operator:** add every operator ([d11f32e](https://github.com/ReactiveX/RxJS/commit/d11f32e))
* **operator:** add timeInterval operator ([6cc0615](https://github.com/ReactiveX/RxJS/commit/6cc0615))
* **share:** add the share operator ([c36f2be](https://github.com/ReactiveX/RxJS/commit/c36f2be)), closes [#439](https://github.com/ReactiveX/RxJS/issues/439)
* **shareReplay:** add the shareReplay() operator ([65c84ea](https://github.com/ReactiveX/RxJS/commit/65c84ea))

### Performance Improvements

* **ReplaySubject:** remove unnecessary computation ([488ac2e](https://github.com/ReactiveX/RxJS/commit/488ac2e))


### BREAKING CHANGES

* S:
The function signature of resultSelectors used to be (innerValue,
outerValue, innerIndex, outerIndex) but this commits changes it to
be (outerValue, innerValue, outerIndex, innerIndex), to match
signatures in RxJS 4.


<a name="5.0.0-alpha.2"></a>
# [5.0.0-alpha.2](https://github.com/ReactiveX/RxJS/compare/5.0.0-alpha.1...5.0.0-alpha.2) (2015-09-30)


### Bug Fixes

* **concat:** let observable concat instead of merge ([c17e832](https://github.com/ReactiveX/RxJS/commit/c17e832))

### Features

* **operator:** add find, findIndex operator ([7c6cc9d](https://github.com/ReactiveX/RxJS/commit/7c6cc9d))
* **operator:** add first operator ([274c233](https://github.com/ReactiveX/RxJS/commit/274c233))
* **operator:** add ignoreElements operator ([fe1a952](https://github.com/ReactiveX/RxJS/commit/fe1a952))
* **zip:** zip now supports never-ending iterables ([a5684ba](https://github.com/ReactiveX/RxJS/commit/a5684ba)), closes [#397](https://github.com/ReactiveX/RxJS/issues/397)



<a name="5.0.0-alpha.1"></a>
# [5.0.0-alpha.1](https://github.com/ReactiveX/RxJS/compare/0.0.0-prealpha.3...5.0.0-alpha.1) (2015-09-23)


### Bug Fixes

* **Promises:** escape promise error trap ([c69088a](https://github.com/ReactiveX/RxJS/commit/c69088a))
* **TestScheduler:** ensure TestScheduler subscribes to expectations before hot subjects ([b9b2ba5](https://github.com/ReactiveX/RxJS/commit/b9b2ba5))
* **TestScheduler:** properly schedule actions added dynamically ([069ede4](https://github.com/ReactiveX/RxJS/commit/069ede4))
* **buffer:** do not emit empty buffer when completes ([252fccb](https://github.com/ReactiveX/RxJS/commit/252fccb))
* **bufferTime:** inner intervals will now clean up properly ([4ef41b0](https://github.com/ReactiveX/RxJS/commit/4ef41b0))
* **expand:** Fix expand to stay open until the source Observable completes. ([20ef785](https://github.com/ReactiveX/RxJS/commit/20ef785))
* **expand:** fix expand operator to match Rx3 ([67f9623](https://github.com/ReactiveX/RxJS/commit/67f9623))
* **last:** emit value matches with predicate instead of result of predicate ([0f635ee](https://github.com/ReactiveX/RxJS/commit/0f635ee))
* **merge:** fix issues with async in merge ([7a15304](https://github.com/ReactiveX/RxJS/commit/7a15304))
* **mergeAll:** merge all will properly handle async observables ([43b63cc](https://github.com/ReactiveX/RxJS/commit/43b63cc))
* **package:** specify supported npm version ([f72e622](https://github.com/ReactiveX/RxJS/commit/f72e622))
* **switchAll:** switch all will properly handle async observables ([c2e2d29](https://github.com/ReactiveX/RxJS/commit/c2e2d29))
* **switchAll/switchLatest:** inner subscriptions should now properly unsub ([38a45f8](https://github.com/ReactiveX/RxJS/commit/38a45f8)), closes [#302](https://github.com/ReactiveX/RxJS/issues/302)

### Features

* **combineLatest:** supports promises, iterables, lowercase-o observables and Observables ([ce76e4e](https://github.com/ReactiveX/RxJS/commit/ce76e4e))
* **config:** add global configuration of Promise capability ([e7eb5d7](https://github.com/ReactiveX/RxJS/commit/e7eb5d7)), closes [#115](https://github.com/ReactiveX/RxJS/issues/115)
* **expand:** now handles promises, iterables and lowercase-o observables ([c5239e9](https://github.com/ReactiveX/RxJS/commit/c5239e9))
* **mergeAll:** now supports promises, iterables and lowercase-o observables ([4c16aa6](https://github.com/ReactiveX/RxJS/commit/4c16aa6))
* **operator:** add elementAt operator ([cd562c4](https://github.com/ReactiveX/RxJS/commit/cd562c4))
* **operator:** add isEmpty operator ([80f72c5](https://github.com/ReactiveX/RxJS/commit/80f72c5))
* **operator:** add last operator ([d841b11](https://github.com/ReactiveX/RxJS/commit/d841b11)), closes [#304](https://github.com/ReactiveX/RxJS/issues/304) [#306](https://github.com/ReactiveX/RxJS/issues/306)
* **operator:** add single operator ([49484a2](https://github.com/ReactiveX/RxJS/commit/49484a2))
* **switch:** add promise, iterable and array support ([24fdd34](https://github.com/ReactiveX/RxJS/commit/24fdd34))
* **withLatestFrom:** default array output, handle other types ([cb393dc](https://github.com/ReactiveX/RxJS/commit/cb393dc))
* **zip:** supports promises, iterables and lowercase-o observables ([d332a0e](https://github.com/ReactiveX/RxJS/commit/d332a0e))



<a name="0.0.0-prealpha.3"></a>
# [0.0.0-prealpha.3](https://github.com/ReactiveX/RxJS/compare/0.0.0-prealpha.2...0.0.0-prealpha.3) (2015-09-11)


### Bug Fixes

* **root:** use self as the root object when available ([0428a85](https://github.com/ReactiveX/RxJS/commit/0428a85))



<a name="0.0.0-prealpha.2"></a>
# [0.0.0-prealpha.2](https://github.com/ReactiveX/RxJS/compare/0.0.0-prealpha.1...0.0.0-prealpha.2) (2015-09-11)


### Bug Fixes

* **bufferCount:** set default value for skip argument, do not emit empty buffer at the end ([2c1a9dc](https://github.com/ReactiveX/RxJS/commit/2c1a9dc))
* **windowCount:** set default value for skip argument, do not emit empty buffer at the end ([a513dbb](https://github.com/ReactiveX/RxJS/commit/a513dbb))

### Features

* **Observable:** add static create method ([e0d27ba](https://github.com/ReactiveX/RxJS/commit/e0d27ba)), closes [#255](https://github.com/ReactiveX/RxJS/issues/255)
* **TestScheduler:** add TestScheduler ([b23daf1](https://github.com/ReactiveX/RxJS/commit/b23daf1)), closes [#270](https://github.com/ReactiveX/RxJS/issues/270)
* **VirtualTimeScheduler:** add VirtualTimeScheduler ([96f9386](https://github.com/ReactiveX/RxJS/commit/96f9386)), closes [#269](https://github.com/ReactiveX/RxJS/issues/269)
* **operator:** add sample and sampleTime ([9e62789](https://github.com/ReactiveX/RxJS/commit/9e62789)), closes [#178](https://github.com/ReactiveX/RxJS/issues/178)



<a name="0.0.0-prealpha.1"></a>
# [0.0.0-prealpha.1](https://github.com/ReactiveX/RxJS/compare/0441dea...0.0.0-prealpha.1) (2015-09-02)


### Bug Fixes

* **combineLatest:** check for limits higher than total observable count ([81e5dfb](https://github.com/ReactiveX/RxJS/commit/81e5dfb))
* **rx:** add hack to export global until better global build exists ([1a543b0](https://github.com/ReactiveX/RxJS/commit/1a543b0))
* **subscription-ref:** add setter for isDisposed ([6fe5427](https://github.com/ReactiveX/RxJS/commit/6fe5427))
* **take:** complete on limit reached ([801a711](https://github.com/ReactiveX/RxJS/commit/801a711))

### Features

* **benchpress:** add benchpress config and flatmap spec ([0441dea](https://github.com/ReactiveX/RxJS/commit/0441dea))
* **catch:** add catch operator, related to #141, closes #130 ([94b4c01](https://github.com/ReactiveX/RxJS/commit/94b4c01)), closes [#130](https://github.com/ReactiveX/RxJS/issues/130)
* **from:** let from handle any "observablesque" ([526d4c3](https://github.com/ReactiveX/RxJS/commit/526d4c3)), closes [#156](https://github.com/ReactiveX/RxJS/issues/156) [#236](https://github.com/ReactiveX/RxJS/issues/236)
* **index:** add index module which requires commonjs build ([379d2d1](https://github.com/ReactiveX/RxJS/commit/379d2d1)), closes [#117](https://github.com/ReactiveX/RxJS/issues/117)
* **observable:** add Observable.all (forkJoin) ([44a4ee1](https://github.com/ReactiveX/RxJS/commit/44a4ee1))
* **operator:** Add count operator. ([30dd894](https://github.com/ReactiveX/RxJS/commit/30dd894))
* **operator:** Add distinctUntilChanged and distinctUntilKeyChanged ([f9ba4da](https://github.com/ReactiveX/RxJS/commit/f9ba4da))
* **operator:** Add do operator. ([7d9b52b](https://github.com/ReactiveX/RxJS/commit/7d9b52b))
* **operator:** Add expand operator. ([47b178b](https://github.com/ReactiveX/RxJS/commit/47b178b))
* **operator:** Add minimal delay operator. ([7851885](https://github.com/ReactiveX/RxJS/commit/7851885))
* **operator:** add buffer operators: buffer, bufferWhen, bufferTime, bufferCount, and bufferTog ([9f8347f](https://github.com/ReactiveX/RxJS/commit/9f8347f)), closes [#207](https://github.com/ReactiveX/RxJS/issues/207)
* **operator:** add debounce ([f03adaf](https://github.com/ReactiveX/RxJS/commit/f03adaf)), closes [#193](https://github.com/ReactiveX/RxJS/issues/193)
* **operator:** add defaultIfEmpty ([c80688b](https://github.com/ReactiveX/RxJS/commit/c80688b))
* **operator:** add finally ([526e4c9](https://github.com/ReactiveX/RxJS/commit/526e4c9))
* **operator:** add fromEventPattern creator function ([1095d4c](https://github.com/ReactiveX/RxJS/commit/1095d4c))
* **operator:** add groupBy ([1e13aea](https://github.com/ReactiveX/RxJS/commit/1e13aea)), closes [#165](https://github.com/ReactiveX/RxJS/issues/165)
* **operator:** add materialize. closes #132 ([6d9f6ae](https://github.com/ReactiveX/RxJS/commit/6d9f6ae)), closes [#132](https://github.com/ReactiveX/RxJS/issues/132)
* **operator:** add publishBehavior operator and spec ([249ab8d](https://github.com/ReactiveX/RxJS/commit/249ab8d))
* **operator:** add publishReplay operator and spec ([a0c47d6](https://github.com/ReactiveX/RxJS/commit/a0c47d6))
* **operator:** add retry ([4451db5](https://github.com/ReactiveX/RxJS/commit/4451db5))
* **operator:** add retryWhen operator. closes #129 ([65eb50e](https://github.com/ReactiveX/RxJS/commit/65eb50e)), closes [#129](https://github.com/ReactiveX/RxJS/issues/129)
* **operator:** add skipUntil ([ef2620e](https://github.com/ReactiveX/RxJS/commit/ef2620e)), closes [#180](https://github.com/ReactiveX/RxJS/issues/180)
* **operator:** add throttle ([1d735b9](https://github.com/ReactiveX/RxJS/commit/1d735b9)), closes [#191](https://github.com/ReactiveX/RxJS/issues/191)
* **operator:** add timeout and timeoutWith ([bb440ad](https://github.com/ReactiveX/RxJS/commit/bb440ad)), closes [#244](https://github.com/ReactiveX/RxJS/issues/244)
* **operator:** add toPromise operator. closes #159 ([361a53b](https://github.com/ReactiveX/RxJS/commit/361a53b)), closes [#159](https://github.com/ReactiveX/RxJS/issues/159)
* **operator:** add window operators: window, windowWhen, windowTime, windowCount, windowToggle ([9f5d510](https://github.com/ReactiveX/RxJS/commit/9f5d510)), closes [#195](https://github.com/ReactiveX/RxJS/issues/195)
* **operator:** add withLatestFrom ([322218a](https://github.com/ReactiveX/RxJS/commit/322218a)), closes [#209](https://github.com/ReactiveX/RxJS/issues/209)
* **operator:** implement startWith(). ([1f36d99](https://github.com/ReactiveX/RxJS/commit/1f36d99))



