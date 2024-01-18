//////////////////////////////////////////////////////////
// Here we need to reference our other deep imports
// so VS code will figure out where they are
// see conversation here:
// https://github.com/microsoft/TypeScript/issues/43034
//////////////////////////////////////////////////////////

/* eslint-disable @typescript-eslint/triple-slash-reference */
// It's tempting to add references to all of the deep-import locations, but
// adding references to those that require DOM types breaks Node projects.
/// <reference path="./operators/index.ts" />
/// <reference path="./testing/index.ts" />
/* eslint-enable @typescript-eslint/triple-slash-reference */

/* Re-export from @rxjs/observable */
export type { GlobalConfig, SubscriberOverrides } from '@rxjs/observable';
export { Observable, from, config, Subscription, Subscriber, operate, UnsubscriptionError, isObservable } from '@rxjs/observable';

/* Observables */
export type { GroupedObservable } from './internal/operators/groupBy.js';
export type { Operator } from './internal/Operator.js';
export { animationFrames } from './internal/observable/dom/animationFrames.js';

/* Subjects */
export { Subject } from './internal/Subject.js';
export { BehaviorSubject } from './internal/BehaviorSubject.js';
export { ReplaySubject } from './internal/ReplaySubject.js';
export { AsyncSubject } from './internal/AsyncSubject.js';

/* Schedulers */
export { asapScheduler } from './internal/scheduler/asap.js';
export { asyncScheduler } from './internal/scheduler/async.js';
export { queueScheduler } from './internal/scheduler/queue.js';
export { animationFrameScheduler } from './internal/scheduler/animationFrame.js';
export { VirtualTimeScheduler, VirtualAction } from './internal/scheduler/VirtualTimeScheduler.js';
export { Scheduler } from './internal/Scheduler.js';

/* Utils */
export { rx } from './internal/util/rx.js';
export { pipe } from './internal/util/pipe.js';
export { noop } from './internal/util/noop.js';
export { identity } from './internal/util/identity.js';

/* Promise Conversion */
export { lastValueFrom } from './internal/lastValueFrom.js';
export { firstValueFrom } from './internal/firstValueFrom.js';

/* Error types */
export { ArgumentOutOfRangeError } from './internal/util/ArgumentOutOfRangeError.js';
export { EmptyError } from './internal/util/EmptyError.js';
export { NotFoundError } from './internal/util/NotFoundError.js';
export { SequenceError } from './internal/util/SequenceError.js';
export { TimeoutError } from './internal/operators/timeout.js';

/* Static observable creation exports */
export { bindCallback } from './internal/observable/bindCallback.js';
export { bindNodeCallback } from './internal/observable/bindNodeCallback.js';
export { combineLatest } from './internal/observable/combineLatest.js';
export { concat } from './internal/observable/concat.js';
export { connectable } from './internal/observable/connectable.js';
export { defer } from './internal/observable/defer.js';
export { forkJoin } from './internal/observable/forkJoin.js';
export { fromEvent } from './internal/observable/fromEvent.js';
export { fromEventPattern } from './internal/observable/fromEventPattern.js';
export { generate } from './internal/observable/generate.js';
export { iif } from './internal/observable/iif.js';
export { interval } from './internal/observable/interval.js';
export { merge } from './internal/observable/merge.js';
export { of } from './internal/observable/of.js';
export { onErrorResumeNext } from './internal/observable/onErrorResumeNext.js';
export { partition } from './internal/observable/partition.js';
export { race } from './internal/observable/race.js';
export { range } from './internal/observable/range.js';
export { throwError } from './internal/observable/throwError.js';
export { timer } from './internal/observable/timer.js';
export { using } from './internal/observable/using.js';
export { zip } from './internal/observable/zip.js';
export { scheduled } from './internal/scheduled/scheduled.js';

/* Constants */
export { EMPTY } from './internal/observable/empty.js';
export { NEVER } from './internal/observable/never.js';

/* Types */
export * from './internal/types.js';

/* Operators */
export { audit } from './internal/operators/audit.js';
export { auditTime } from './internal/operators/auditTime.js';
export { buffer } from './internal/operators/buffer.js';
export { bufferCount } from './internal/operators/bufferCount.js';
export { bufferTime } from './internal/operators/bufferTime.js';
export { bufferToggle } from './internal/operators/bufferToggle.js';
export { bufferWhen } from './internal/operators/bufferWhen.js';
export { catchError } from './internal/operators/catchError.js';
export { combineLatestAll } from './internal/operators/combineLatestAll.js';
export { combineLatestWith } from './internal/operators/combineLatestWith.js';
export { concatAll } from './internal/operators/concatAll.js';
export { concatMap } from './internal/operators/concatMap.js';
export { concatMapTo } from './internal/operators/concatMapTo.js';
export { concatWith } from './internal/operators/concatWith.js';
export type { ConnectConfig } from './internal/operators/connect.js';
export { connect } from './internal/operators/connect.js';
export { count } from './internal/operators/count.js';
export { debounce } from './internal/operators/debounce.js';
export { debounceTime } from './internal/operators/debounceTime.js';
export { defaultIfEmpty } from './internal/operators/defaultIfEmpty.js';
export { delay } from './internal/operators/delay.js';
export { delayWhen } from './internal/operators/delayWhen.js';
export { dematerialize } from './internal/operators/dematerialize.js';
export { distinct } from './internal/operators/distinct.js';
export { distinctUntilChanged } from './internal/operators/distinctUntilChanged.js';
export { distinctUntilKeyChanged } from './internal/operators/distinctUntilKeyChanged.js';
export { elementAt } from './internal/operators/elementAt.js';
export { endWith } from './internal/operators/endWith.js';
export { every } from './internal/operators/every.js';
export { exhaustAll } from './internal/operators/exhaustAll.js';
export { exhaustMap } from './internal/operators/exhaustMap.js';
export { expand } from './internal/operators/expand.js';
export { filter } from './internal/operators/filter.js';
export { finalize } from './internal/operators/finalize.js';
export { find } from './internal/operators/find.js';
export { findIndex } from './internal/operators/findIndex.js';
export { first } from './internal/operators/first.js';
export type { BasicGroupByOptions, GroupByOptionsWithElement } from './internal/operators/groupBy.js';
export { groupBy } from './internal/operators/groupBy.js';
export { ignoreElements } from './internal/operators/ignoreElements.js';
export { isEmpty } from './internal/operators/isEmpty.js';
export { last } from './internal/operators/last.js';
export { map } from './internal/operators/map.js';
export { mapTo } from './internal/operators/mapTo.js';
export { materialize } from './internal/operators/materialize.js';
export { max } from './internal/operators/max.js';
export { mergeAll } from './internal/operators/mergeAll.js';
export { mergeMap } from './internal/operators/mergeMap.js';
export { mergeMapTo } from './internal/operators/mergeMapTo.js';
export { mergeScan } from './internal/operators/mergeScan.js';
export { mergeWith } from './internal/operators/mergeWith.js';
export { min } from './internal/operators/min.js';
export { observeOn } from './internal/operators/observeOn.js';
export { onErrorResumeNextWith } from './internal/operators/onErrorResumeNextWith.js';
export { pairwise } from './internal/operators/pairwise.js';
export { raceWith } from './internal/operators/raceWith.js';
export { reduce } from './internal/operators/reduce.js';
export type { RepeatConfig } from './internal/operators/repeat.js';
export { repeat } from './internal/operators/repeat.js';
export { repeatWhen } from './internal/operators/repeatWhen.js';
export type { RetryConfig } from './internal/operators/retry.js';
export { retry } from './internal/operators/retry.js';
export { retryWhen } from './internal/operators/retryWhen.js';
export { sample } from './internal/operators/sample.js';
export { sampleTime } from './internal/operators/sampleTime.js';
export { scan } from './internal/operators/scan.js';
export { sequenceEqual } from './internal/operators/sequenceEqual.js';
export type { ShareConfig } from './internal/operators/share.js';
export { share } from './internal/operators/share.js';
export type { ShareReplayConfig } from './internal/operators/shareReplay.js';
export { shareReplay } from './internal/operators/shareReplay.js';
export { single } from './internal/operators/single.js';
export { skip } from './internal/operators/skip.js';
export { skipLast } from './internal/operators/skipLast.js';
export { skipUntil } from './internal/operators/skipUntil.js';
export { skipWhile } from './internal/operators/skipWhile.js';
export { startWith } from './internal/operators/startWith.js';
export { subscribeOn } from './internal/operators/subscribeOn.js';
export { switchAll } from './internal/operators/switchAll.js';
export { switchMap } from './internal/operators/switchMap.js';
export { switchMapTo } from './internal/operators/switchMapTo.js';
export { switchScan } from './internal/operators/switchScan.js';
export { take } from './internal/operators/take.js';
export { takeLast } from './internal/operators/takeLast.js';
export { takeUntil } from './internal/operators/takeUntil.js';
export { takeWhile } from './internal/operators/takeWhile.js';
export type { TapObserver } from './internal/operators/tap.js';
export { tap } from './internal/operators/tap.js';
export type { ThrottleConfig } from './internal/operators/throttle.js';
export { throttle } from './internal/operators/throttle.js';
export { throttleTime } from './internal/operators/throttleTime.js';
export { throwIfEmpty } from './internal/operators/throwIfEmpty.js';
export { timeInterval } from './internal/operators/timeInterval.js';
export type { TimeoutConfig, TimeoutInfo } from './internal/operators/timeout.js';
export { timeout } from './internal/operators/timeout.js';
export { timeoutWith } from './internal/operators/timeoutWith.js';
export { timestamp } from './internal/operators/timestamp.js';
export { toArray } from './internal/operators/toArray.js';
export { window } from './internal/operators/window.js';
export { windowCount } from './internal/operators/windowCount.js';
export { windowTime } from './internal/operators/windowTime.js';
export { windowToggle } from './internal/operators/windowToggle.js';
export { windowWhen } from './internal/operators/windowWhen.js';
export { withLatestFrom } from './internal/operators/withLatestFrom.js';
export { zipAll } from './internal/operators/zipAll.js';
export { zipWith } from './internal/operators/zipWith.js';
