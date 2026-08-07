import '@rxjs/observable-polyfill';

export { ArgumentOutOfRangeError } from './argument-out-of-range-error.js';
export { AsyncSubject } from './async-subject.js';
export { behaviorSubject } from './behavior-subject.js';
export { ColdObservable } from './cold-observable.js';
export { ConnectableObservable, connectable, type ConnectableConfig, type ConnectableConnection } from './connectable.js';
export { EmptyError } from './empty-error.js';
export { NotFoundError } from './not-found-error.js';
export {
  COMPLETE_NOTIFICATION,
  Notification,
  NotificationKind,
  errorNotification,
  nextNotification,
  observeNotification,
  type CompleteNotification,
  type ErrorNotification,
  type NextNotification,
  type ObservableNotification,
  type ValueFromNotification,
} from './notification.js';
export { PerSubscriptionSubjectBase } from './per-subscription-subject-base.js';
export { filter } from './pipeable/filter.js';
export { map } from './pipeable/map.js';
export { subscribe, type Subscription } from './pipeable/subscribe.js';
export { take } from './pipeable/take.js';
export { toArray } from './pipeable/to-array.js';
export type { OperatorFunction, UnaryFunction } from './pipeable/types.js';
export { replaySubject, type ReplaySubjectConfig } from './replay-subject.js';
export { rx } from './rx.js';
export { SequenceError } from './sequence-error.js';
export { Subject } from './subject.js';
export { TimeoutError, type TimeoutInfo } from './timeout-error.js';

// BEGIN GENERATED FUNCTIONAL SURFACE

export { animationFrames } from './static/animation-frames.js';
export type { AnimationFrameTimestampProvider } from './animation-frames.js';
export { bufferTime } from './pipeable/buffer-time.js';
export { bufferToggle } from './pipeable/buffer-toggle.js';
export { buffer } from './pipeable/buffer.js';
export { catchError } from './pipeable/catch-error.js';
export { combineLatestAll } from './pipeable/combine-latest-all.js';
export { combineLatestWith } from './pipeable/combine-latest-with.js';
export { combineLatest } from './static/combine-latest.js';
export { combineWith } from './pipeable/combine-with.js';
export { combine } from './static/combine.js';
export { concatWith } from './pipeable/concat-with.js';
export { concat } from './static/concat.js';
export { connect } from './pipeable/connect.js';
export type { ConnectConfig } from './connect.js';
export { count } from './pipeable/count.js';
export { debounce } from './pipeable/debounce.js';
export { defaultIfEmpty } from './pipeable/default-if-empty.js';
export { delayWhen } from './pipeable/delay-when.js';
export { delay } from './pipeable/delay.js';
export { dematerialize } from './pipeable/dematerialize.js';
export { distinctUntilChanged } from './pipeable/distinct-until-changed.js';
export { distinctUntilKeyChanged } from './pipeable/distinct-until-key-changed.js';
export { distinct } from './pipeable/distinct.js';
export { elementAt } from './pipeable/element-at.js';
export { every } from './pipeable/every.js';
export { exhaustMap } from './pipeable/exhaust-map.js';
export { expand } from './pipeable/expand.js';
export type { ExpandOptions } from './expand.js';
export { finalize } from './pipeable/finalize.js';
export { findIndex } from './pipeable/find-index.js';
export { find } from './pipeable/find.js';
export { first } from './pipeable/first.js';
export { forkJoin } from './static/fork-join.js';
export { generate } from './static/generate.js';
export type { GenerateBaseOptions, GenerateOptions } from './generate.js';
export { groupBy } from './pipeable/group-by.js';
export type { KeyedGroupObservable, GroupByOptions } from './group-by.js';
export { interval } from './static/interval.js';
export { isEmpty } from './pipeable/is-empty.js';
export { iterateBufferedValues } from './pipeable/iterate-buffered-values.js';
export { iterateEachValue } from './pipeable/iterate-each-value.js';
export { iterateLatestValue } from './pipeable/iterate-latest-value.js';
export { iterateNextValue } from './pipeable/iterate-next-value.js';
export { last } from './pipeable/last.js';
export { materialize } from './pipeable/materialize.js';
export { max } from './pipeable/max.js';
export { mergeMap } from './pipeable/merge-map.js';
export { mergeScan } from './pipeable/merge-scan.js';
export { mergeWith } from './pipeable/merge-with.js';
export { merge } from './static/merge.js';
export { min } from './pipeable/min.js';
export { multicast } from './pipeable/multicast.js';
export { observeOn } from './pipeable/observe-on.js';
export { onErrorResumeNextWith } from './pipeable/on-error-resume-next-with.js';
export { onErrorResumeNext } from './static/on-error-resume-next.js';
export { pairwise } from './pipeable/pairwise.js';
export { partition } from './static/partition.js';
export { pipe } from './pipeable/pipe.js';
export { pluck } from './pipeable/pluck.js';
export { publishBehavior } from './pipeable/publish-behavior.js';
export { publishLast } from './pipeable/publish-last.js';
export { publishReplay } from './pipeable/publish-replay.js';
export type { PublishReplayTimestampProvider } from './publish-replay.js';
export { publish } from './pipeable/publish.js';
export { raceWith } from './pipeable/race-with.js';
export { race } from './static/race.js';
export { reduce } from './pipeable/reduce.js';
export { refCount } from './pipeable/ref-count.js';
export { repeatWhen } from './pipeable/repeat-when.js';
export { repeat } from './pipeable/repeat.js';
export { retryWhen } from './pipeable/retry-when.js';
export { retry } from './pipeable/retry.js';
export { sampleTime } from './pipeable/sample-time.js';
export { sample } from './pipeable/sample.js';
export { scan } from './pipeable/scan.js';
export { sequenceEqual } from './pipeable/sequence-equal.js';
export { shareReplay } from './pipeable/share-replay.js';
export type { ShareReplayConfig } from './share-replay.js';
export { share } from './pipeable/share.js';
export type { ShareConfig } from './share.js';
export { single } from './pipeable/single.js';
export { skipLast } from './pipeable/skip-last.js';
export { skipUntil } from './pipeable/skip-until.js';
export { skipWhile } from './pipeable/skip-while.js';
export { skip } from './pipeable/skip.js';
export { startWith } from './pipeable/start-with.js';
export { subscribeOn } from './pipeable/subscribe-on.js';
export { switchMap } from './pipeable/switch-map.js';
export { switchScan } from './pipeable/switch-scan.js';
export { takeLast } from './pipeable/take-last.js';
export { takeUntil } from './pipeable/take-until.js';
export { takeWhile } from './pipeable/take-while.js';
export { tap } from './pipeable/tap.js';
export type { TapObserver } from './tap.js';
export { throttle } from './pipeable/throttle.js';
export { throwIfEmpty } from './pipeable/throw-if-empty.js';
export { timeInterval } from './pipeable/time-interval.js';
export { TimeInterval } from './time-interval.js';
export type { TimeIntervalProvider } from './time-interval.js';
export { timeout } from './pipeable/timeout.js';
export { timer } from './static/timer.js';
export { timestamp } from './pipeable/timestamp.js';
export type { TimestampProvider, Timestamp } from './timestamp.js';
export { windowCount } from './pipeable/window-count.js';
export { windowTime } from './pipeable/window-time.js';
export { windowToggle } from './pipeable/window-toggle.js';
export { windowWhen } from './pipeable/window-when.js';
export { window } from './pipeable/window.js';
export { withLatestFrom } from './pipeable/with-latest-from.js';
export { zipAll } from './pipeable/zip-all.js';
export { zipWith } from './pipeable/zip-with.js';

// END GENERATED FUNCTIONAL SURFACE
