/* tslint:disable:no-unused-variable */
// Subject imported before Observable to bypass circular dependency issue since
// Subject extends Observable and Observable references Subject in it's
// definition
export {Subject, AnonymousSubject} from '../../src/Subject';
/* tslint:enable:no-unused-variable */
export {Observable} from '../../src/Observable';

// statics
/* tslint:disable:no-use-before-declare */
import '../../src/add/observable/bindCallback';
import '../../src/add/observable/bindNodeCallback';
import '../../src/add/observable/combineLatest';
import '../../src/add/observable/concat';
import '../../src/add/observable/defer';
import '../../src/add/observable/empty';
import '../../src/add/observable/forkJoin';
import '../../src/add/observable/from';
import '../../src/add/observable/fromEvent';
import '../../src/add/observable/fromEventPattern';
import '../../src/add/observable/fromPromise';
import '../../src/add/observable/generate';
import '../../src/add/observable/if';
import '../../src/add/observable/interval';
import '../../src/add/observable/merge';
import '../../src/add/observable/race';
import '../../src/add/observable/never';
import '../../src/add/observable/of';
import '../../src/add/observable/onErrorResumeNext';
import '../../src/add/observable/pairs';
import '../../src/add/observable/range';
import '../../src/add/observable/using';
import '../../src/add/observable/throw';
import '../../src/add/observable/timer';
import '../../src/add/observable/zip';

//dom
import '../../src/add/observable/dom/ajax';
import '../../src/add/observable/dom/webSocket';

//operators
import '../../src/add/operator/buffer';
import '../../src/add/operator/bufferCount';
import '../../src/add/operator/bufferTime';
import '../../src/add/operator/bufferToggle';
import '../../src/add/operator/bufferWhen';
import '../../src/add/operator/catch';
import '../../src/add/operator/combineAll';
import '../../src/add/operator/combineLatest';
import '../../src/add/operator/concat';
import '../../src/add/operator/concatAll';
import '../../src/add/operator/concatMap';
import '../../src/add/operator/concatMapTo';
import '../../src/add/operator/count';
import '../../src/add/operator/dematerialize';
import '../../src/add/operator/debounce';
import '../../src/add/operator/debounceTime';
import '../../src/add/operator/defaultIfEmpty';
import '../../src/add/operator/delay';
import '../../src/add/operator/delayWhen';
import '../../src/add/operator/distinct';
import '../../src/add/operator/distinctUntilChanged';
import '../../src/add/operator/distinctUntilKeyChanged';
import '../../src/add/operator/do';
import '../../src/add/operator/exhaust';
import '../../src/add/operator/exhaustMap';
import '../../src/add/operator/expand';
import '../../src/add/operator/elementAt';
import '../../src/add/operator/filter';
import '../../src/add/operator/finally';
import '../../src/add/operator/find';
import '../../src/add/operator/findIndex';
import '../../src/add/operator/first';
import '../../src/add/operator/groupBy';
import '../../src/add/operator/ignoreElements';
import '../../src/add/operator/isEmpty';
import '../../src/add/operator/audit';
import '../../src/add/operator/auditTime';
import '../../src/add/operator/last';
import '../../src/add/operator/let';
import '../../src/add/operator/every';
import '../../src/add/operator/map';
import '../../src/add/operator/mapTo';
import '../../src/add/operator/materialize';
import '../../src/add/operator/max';
import '../../src/add/operator/merge';
import '../../src/add/operator/mergeAll';
import '../../src/add/operator/mergeMap';
import '../../src/add/operator/mergeMapTo';
import '../../src/add/operator/mergeScan';
import '../../src/add/operator/min';
import '../../src/add/operator/multicast';
import '../../src/add/operator/observeOn';
import '../../src/add/operator/onErrorResumeNext';
import '../../src/add/operator/pairwise';
import '../../src/add/operator/partition';
import '../../src/add/operator/pluck';
import '../../src/add/operator/publish';
import '../../src/add/operator/publishBehavior';
import '../../src/add/operator/publishReplay';
import '../../src/add/operator/publishLast';
import '../../src/add/operator/race';
import '../../src/add/operator/reduce';
import '../../src/add/operator/repeat';
import '../../src/add/operator/repeatWhen';
import '../../src/add/operator/retry';
import '../../src/add/operator/retryWhen';
import '../../src/add/operator/sample';
import '../../src/add/operator/sampleTime';
import '../../src/add/operator/scan';
import '../../src/add/operator/sequenceEqual';
import '../../src/add/operator/share';
import '../../src/add/operator/shareReplay';
import '../../src/add/operator/single';
import '../../src/add/operator/skip';
import '../../src/add/operator/skipLast';
import '../../src/add/operator/skipUntil';
import '../../src/add/operator/skipWhile';
import '../../src/add/operator/startWith';
import '../../src/add/operator/subscribeOn';
import '../../src/add/operator/switch';
import '../../src/add/operator/switchMap';
import '../../src/add/operator/switchMapTo';
import '../../src/add/operator/take';
import '../../src/add/operator/takeLast';
import '../../src/add/operator/takeUntil';
import '../../src/add/operator/takeWhile';
import '../../src/add/operator/throttle';
import '../../src/add/operator/throttleTime';
import '../../src/add/operator/timeInterval';
import '../../src/add/operator/timeout';
import '../../src/add/operator/timeoutWith';
import '../../src/add/operator/timestamp';
import '../../src/add/operator/toArray';
import '../../src/add/operator/toPromise';
import '../../src/add/operator/window';
import '../../src/add/operator/windowCount';
import '../../src/add/operator/windowTime';
import '../../src/add/operator/windowToggle';
import '../../src/add/operator/windowWhen';
import '../../src/add/operator/withLatestFrom';
import '../../src/add/operator/zip';
import '../../src/add/operator/zipAll';

/* tslint:disable:no-unused-variable */
export {Operator} from '../../src/Operator';
export {Observer} from '../../src/Observer';
export {Subscription} from '../../src/Subscription';
export {Subscriber} from '../../src/Subscriber';
export {AsyncSubject} from '../../src/AsyncSubject';
export {ReplaySubject} from '../../src/ReplaySubject';
export {BehaviorSubject} from '../../src/BehaviorSubject';
export {ConnectableObservable} from '../../src/observable/ConnectableObservable';
export {Notification} from '../../src/Notification';
export {EmptyError} from '../../src/util/EmptyError';
export {ArgumentOutOfRangeError} from '../../src/util/ArgumentOutOfRangeError';
export {ObjectUnsubscribedError} from '../../src/util/ObjectUnsubscribedError';
export {TimeoutError} from '../../src/util/TimeoutError';
export {UnsubscriptionError} from '../../src/util/UnsubscriptionError';
export {TimeInterval} from '../../src/operator/timeInterval';
export {Timestamp} from '../../src/operators/timestamp';
export {TestScheduler} from '../../src/testing/TestScheduler';
export {VirtualTimeScheduler} from '../../src/scheduler/VirtualTimeScheduler';
export {AjaxRequest, AjaxResponse, AjaxError, AjaxTimeoutError} from '../../src/observable/dom/AjaxObservable';
export { pipe } from '../../src/util/pipe';

import { asap } from '../../src/scheduler/asap';
import { async } from '../../src/scheduler/async';
import { queue } from '../../src/scheduler/queue';
import { animationFrame } from '../../src/scheduler/animationFrame';
import { AsapScheduler } from '../../src/scheduler/AsapScheduler';
import { AsyncScheduler } from '../../src/scheduler/AsyncScheduler';
import { QueueScheduler } from '../../src/scheduler/QueueScheduler';
import { AnimationFrameScheduler } from '../../src/scheduler/AnimationFrameScheduler';
import { rxSubscriber } from '../../src/symbol/rxSubscriber';
import { iterator } from '../../src/symbol/iterator';
import { observable } from '../../src/symbol/observable';

import * as _operators from '../../src/operators';

export const operators = _operators;

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
