/* tslint:disable:no-unused-variable */
// Subject imported before Observable to bypass circular dependency issue since
// Subject extends Observable and Observable references Subject in it's
// definition
export {Subject, AnonymousSubject} from './Subject';
/* tslint:enable:no-unused-variable */
export {Observable} from './Observable';

// statics
/* tslint:disable:no-use-before-declare */
import './add/observable/bindCallback';
import './add/observable/bindNodeCallback';
import './add/observable/combineLatest';
import './add/observable/concat';
import './add/observable/defer';
import './add/observable/empty';
import './add/observable/forkJoin';
import './add/observable/from';
import './add/observable/fromEvent';
import './add/observable/fromEventPattern';
import './add/observable/fromPromise';
import './add/observable/generate';
import './add/observable/if';
import './add/observable/interval';
import './add/observable/merge';
import './add/observable/race';
import './add/observable/never';
import './add/observable/of';
import './add/observable/onErrorResumeNext';
import './add/observable/pairs';
import './add/observable/range';
import './add/observable/using';
import './add/observable/throw';
import './add/observable/timer';
import './add/observable/zip';

//dom
import './add/observable/dom/ajax';
import './add/observable/dom/webSocket';

//operators
import './add/operator/buffer';
import './add/operator/bufferCount';
import './add/operator/bufferTime';
import './add/operator/bufferToggle';
import './add/operator/bufferWhen';
import './add/operator/catch';
import './add/operator/combineAll';
import './add/operator/combineLatest';
import './add/operator/concat';
import './add/operator/concatAll';
import './add/operator/concatMap';
import './add/operator/concatMapTo';
import './add/operator/count';
import './add/operator/dematerialize';
import './add/operator/debounce';
import './add/operator/debounceTime';
import './add/operator/defaultIfEmpty';
import './add/operator/delay';
import './add/operator/delayWhen';
import './add/operator/distinct';
import './add/operator/distinctUntilChanged';
import './add/operator/distinctUntilKeyChanged';
import './add/operator/do';
import './add/operator/exhaust';
import './add/operator/exhaustMap';
import './add/operator/expand';
import './add/operator/elementAt';
import './add/operator/filter';
import './add/operator/finally';
import './add/operator/find';
import './add/operator/findIndex';
import './add/operator/first';
import './add/operator/groupBy';
import './add/operator/ignoreElements';
import './add/operator/isEmpty';
import './add/operator/audit';
import './add/operator/auditTime';
import './add/operator/last';
import './add/operator/let';
import './add/operator/every';
import './add/operator/map';
import './add/operator/mapTo';
import './add/operator/materialize';
import './add/operator/max';
import './add/operator/merge';
import './add/operator/mergeAll';
import './add/operator/mergeMap';
import './add/operator/mergeMapTo';
import './add/operator/mergeScan';
import './add/operator/min';
import './add/operator/multicast';
import './add/operator/observeOn';
import './add/operator/onErrorResumeNext';
import './add/operator/pairwise';
import './add/operator/partition';
import './add/operator/pluck';
import './add/operator/publish';
import './add/operator/publishBehavior';
import './add/operator/publishReplay';
import './add/operator/publishLast';
import './add/operator/race';
import './add/operator/reduce';
import './add/operator/repeat';
import './add/operator/repeatWhen';
import './add/operator/retry';
import './add/operator/retryWhen';
import './add/operator/sample';
import './add/operator/sampleTime';
import './add/operator/scan';
import './add/operator/sequenceEqual';
import './add/operator/share';
import './add/operator/shareReplay';
import './add/operator/single';
import './add/operator/skip';
import './add/operator/skipLast';
import './add/operator/skipUntil';
import './add/operator/skipWhile';
import './add/operator/startWith';
import './add/operator/subscribeOn';
import './add/operator/switch';
import './add/operator/switchMap';
import './add/operator/switchMapTo';
import './add/operator/take';
import './add/operator/takeLast';
import './add/operator/takeUntil';
import './add/operator/takeWhile';
import './add/operator/throttle';
import './add/operator/throttleTime';
import './add/operator/timeInterval';
import './add/operator/timeout';
import './add/operator/timeoutWith';
import './add/operator/timestamp';
import './add/operator/toArray';
import './add/operator/toPromise';
import './add/operator/window';
import './add/operator/windowCount';
import './add/operator/windowTime';
import './add/operator/windowToggle';
import './add/operator/windowWhen';
import './add/operator/withLatestFrom';
import './add/operator/zip';
import './add/operator/zipAll';

/* tslint:disable:no-unused-variable */
export {Operator} from './Operator';
export {Observer} from './Observer';
export {Subscription} from './Subscription';
export {Subscriber} from './Subscriber';
export {AsyncSubject} from './AsyncSubject';
export {ReplaySubject} from './ReplaySubject';
export {BehaviorSubject} from './BehaviorSubject';
export {ConnectableObservable} from './observable/ConnectableObservable';
export {Notification} from './Notification';
export {EmptyError} from './util/EmptyError';
export {ArgumentOutOfRangeError} from './util/ArgumentOutOfRangeError';
export {ObjectUnsubscribedError} from './util/ObjectUnsubscribedError';
export {TimeoutError} from './util/TimeoutError';
export {UnsubscriptionError} from './util/UnsubscriptionError';
export {TimeInterval} from './operator/timeInterval';
export {Timestamp} from './operators/timestamp';
export {TestScheduler} from './testing/TestScheduler';
export {VirtualTimeScheduler} from './scheduler/VirtualTimeScheduler';
export {AjaxRequest, AjaxResponse, AjaxError, AjaxTimeoutError} from './observable/dom/AjaxObservable';
export { pipe } from './util/pipe';

import { asap } from './scheduler/asap';
import { async } from './scheduler/async';
import { queue } from './scheduler/queue';
import { animationFrame } from './scheduler/animationFrame';
import { AsapScheduler } from './scheduler/AsapScheduler';
import { AsyncScheduler } from './scheduler/AsyncScheduler';
import { QueueScheduler } from './scheduler/QueueScheduler';
import { AnimationFrameScheduler } from './scheduler/AnimationFrameScheduler';
import { rxSubscriber } from './symbol/rxSubscriber';
import { iterator } from './symbol/iterator';
import { observable } from './symbol/observable';

export { audit } from './operators/audit';
export { auditTime } from './operators/auditTime';
export { buffer } from './operators/buffer';
export { bufferCount } from './operators/bufferCount';
export { bufferTime } from './operators/bufferTime';
export { bufferToggle } from './operators/bufferToggle';
export { bufferWhen } from './operators/bufferWhen';
export { catchError } from './operators/catchError';
export { combineAll } from './operators/combineAll';
export { combineLatest } from './operators/combineLatest';
export { concat } from './operators/concat';
export { concatAll } from './operators/concatAll';
export { concatMap } from './operators/concatMap';
export { concatMapTo } from './operators/concatMapTo';
export { count } from './operators/count';
export { debounce } from './operators/debounce';
export { debounceTime } from './operators/debounceTime';
export { defaultIfEmpty } from './operators/defaultIfEmpty';
export { delay } from './operators/delay';
export { delayWhen } from './operators/delayWhen';
export { dematerialize } from './operators/dematerialize';
export { distinct } from './operators/distinct';
export { distinctUntilChanged } from './operators/distinctUntilChanged';
export { distinctUntilKeyChanged } from './operators/distinctUntilKeyChanged';
export { elementAt } from './operators/elementAt';
export { every } from './operators/every';
export { exhaust } from './operators/exhaust';
export { exhaustMap } from './operators/exhaustMap';
export { expand } from './operators/expand';
export { filter } from './operators/filter';
export { finalize } from './operators/finalize';
export { find } from './operators/find';
export { findIndex } from './operators/findIndex';
export { first } from './operators/first';
export { groupBy } from './operators/groupBy';
export { ignoreElements } from './operators/ignoreElements';
export { isEmpty } from './operators/isEmpty';
export { last } from './operators/last';
export { map } from './operators/map';
export { mapTo } from './operators/mapTo';
export { materialize } from './operators/materialize';
export { max } from './operators/max';
export { merge } from './operators/merge';
export { mergeAll } from './operators/mergeAll';
export { mergeMap } from './operators/mergeMap';
export { mergeMapTo } from './operators/mergeMapTo';
export { mergeScan } from './operators/mergeScan';
export { min } from './operators/min';
export { multicast } from './operators/multicast';
export { observeOn } from './operators/observeOn';
export { onErrorResumeNext } from './operators/onErrorResumeNext';
export { pairwise } from './operators/pairwise';
export { partition } from './operators/partition';
export { pluck } from './operators/pluck';
export { publish } from './operators/publish';
export { publishBehavior } from './operators/publishBehavior';
export { publishLast } from './operators/publishLast';
export { publishReplay } from './operators/publishReplay';
export { race } from './operators/race';
export { reduce } from './operators/reduce';
export { repeat } from './operators/repeat';
export { repeatWhen } from './operators/repeatWhen';
export { retry } from './operators/retry';
export { retryWhen } from './operators/retryWhen';
export { refCount } from './operators/refCount';
export { sample } from './operators/sample';
export { sampleTime } from './operators/sampleTime';
export { scan } from './operators/scan';
export { sequenceEqual } from './operators/sequenceEqual';
export { share } from './operators/share';
export { shareReplay } from './operators/shareReplay';
export { single } from './operators/single';
export { skip } from './operators/skip';
export { skipLast } from './operators/skipLast';
export { skipUntil } from './operators/skipUntil';
export { skipWhile } from './operators/skipWhile';
export { startWith } from './operators/startWith';
export { subscribeOn } from './operators/subscribeOn';
export { switchAll } from './operators/switchAll';
export { switchMap } from './operators/switchMap';
export { switchMapTo } from './operators/switchMapTo';
export { take } from './operators/take';
export { takeLast } from './operators/takeLast';
export { takeUntil } from './operators/takeUntil';
export { takeWhile } from './operators/takeWhile';
export { tap } from './operators/tap';
export { throttle } from './operators/throttle';
export { throttleTime } from './operators/throttleTime';
export { timeInterval } from './operators/timeInterval';
export { timeout } from './operators/timeout';
export { timeoutWith } from './operators/timeoutWith';
export { timestamp } from './operators/timestamp';
export { toArray } from './operators/toArray';
export { toPromise } from './operators/toPromise';
export { window } from './operators/window';
export { windowCount } from './operators/windowCount';
export { windowTime } from './operators/windowTime';
export { windowToggle } from './operators/windowToggle';
export { windowWhen } from './operators/windowWhen';
export { withLatestFrom } from './operators/withLatestFrom';
export { zip } from './operators/zip';
export { zipAll } from './operators/zipAll';

/* tslint:enable:no-unused-variable */

/**
 * @typedef {Object} Rx.Scheduler
 * @property {Scheduler} queue Schedules on a queue in the current event frame
 * (trampoline scheduler). Use this for iteration operations.
 * @property {Scheduler} asap Schedules on the micro task queue, which uses the
 * fastest transport mechanism available, either Node.js' `process.nextTick()`
 * or Web Worker MessageChannel or setTimeout or others. Use this for
 * asynchronous conversions.
 * @property {Scheduler} async Schedules work with `setInterval`. Use this for
 * time-based operations.
 * @property {Scheduler} animationFrame Schedules work with `requestAnimationFrame`.
 * Use this for synchronizing with the platform's painting
 */
let Scheduler = {
  asap,
  queue,
  animationFrame,
  async
};

/**
 * @typedef {Object} Rx.Symbol
 * @property {Symbol|string} rxSubscriber A symbol to use as a property name to
 * retrieve an "Rx safe" Observer from an object. "Rx safety" can be defined as
 * an object that has all of the traits of an Rx Subscriber, including the
 * ability to add and remove subscriptions to the subscription chain and
 * guarantees involving event triggering (can't "next" after unsubscription,
 * etc).
 * @property {Symbol|string} observable A symbol to use as a property name to
 * retrieve an Observable as defined by the [ECMAScript "Observable" spec](https://github.com/zenparsing/es-observable).
 * @property {Symbol|string} iterator The ES6 symbol to use as a property name
 * to retrieve an iterator from an object.
 */
let Symbol = {
  rxSubscriber,
  observable,
  iterator
};

export {
    Scheduler,
    Symbol
};
