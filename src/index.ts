//////////////////////////////////////////////////////////
// Here we need to reference our other deep imports
// so VS code will figure out where they are
// see conversation here:
// https://github.com/microsoft/TypeScript/issues/43034
//////////////////////////////////////////////////////////

// tslint:disable: no-reference
// It's tempting to add references to all of the deep-import locations, but
// adding references to those that require DOM types breaks Node projects.
/// <reference path="./operators/index.ts" />
/// <reference path="./testing/index.ts" />
// tslint:enable: no-reference

/* Observable */
export { Observable } from './internal/Observable';
export { ConnectableObservable } from './internal/observable/ConnectableObservable';
export { GroupedObservable } from './internal/operators/groupBy';
export { Operator } from './internal/Operator';
export { observable } from './internal/symbol/observable';
export { animationFrames } from './internal/observable/dom/animationFrames';

/* Subjects */
export { Subject } from './internal/Subject';
export { BehaviorSubject } from './internal/BehaviorSubject';
export { ReplaySubject } from './internal/ReplaySubject';
export { AsyncSubject } from './internal/AsyncSubject';

/* Schedulers */
export { asap, asapScheduler } from './internal/scheduler/asap';
export { async, asyncScheduler } from './internal/scheduler/async';
export { queue, queueScheduler } from './internal/scheduler/queue';
export { animationFrame, animationFrameScheduler } from './internal/scheduler/animationFrame';
export { VirtualTimeScheduler, VirtualAction } from './internal/scheduler/VirtualTimeScheduler';
export { Scheduler } from './internal/Scheduler';

/* Subscription */
export { Subscription } from './internal/Subscription';
export { Subscriber } from './internal/Subscriber';

/* Notification */
export { Notification, NotificationKind } from './internal/Notification';

/* Utils */
export { pipe } from './internal/util/pipe';
export { noop } from './internal/util/noop';
export { identity } from './internal/util/identity';
export { isObservable } from './internal/util/isObservable';

/* Promise Conversion */
export { lastValueFrom } from './internal/lastValueFrom';
export { firstValueFrom } from './internal/firstValueFrom';

/* Error types */
export { ArgumentOutOfRangeError } from './internal/util/ArgumentOutOfRangeError';
export { EmptyError } from './internal/util/EmptyError';
export { NotFoundError } from './internal/util/NotFoundError';
export { ObjectUnsubscribedError } from './internal/util/ObjectUnsubscribedError';
export { SequenceError } from './internal/util/SequenceError';
export { TimeoutError } from './internal/operators/timeout';
export { UnsubscriptionError } from './internal/util/UnsubscriptionError';

/* Static observable creation exports */
export { bindCallback } from './internal/observable/bindCallback';
export { bindNodeCallback } from './internal/observable/bindNodeCallback';
export { combineLatest } from './internal/observable/combineLatest';
export { concat } from './internal/observable/concat';
export { connectable } from './internal/observable/connectable';
export { defer } from './internal/observable/defer';
export { empty } from './internal/observable/empty';
export { forkJoin } from './internal/observable/forkJoin';
export { from } from './internal/observable/from';
export { fromEvent } from './internal/observable/fromEvent';
export { fromEventPattern } from './internal/observable/fromEventPattern';
export { generate } from './internal/observable/generate';
export { iif } from './internal/observable/iif';
export { interval } from './internal/observable/interval';
export { merge } from './internal/observable/merge';
export { never } from './internal/observable/never';
export { of } from './internal/observable/of';
export { onErrorResumeNext } from './internal/observable/onErrorResumeNext';
export { pairs } from './internal/observable/pairs';
export { partition } from './internal/observable/partition';
export { race } from './internal/observable/race';
export { range } from './internal/observable/range';
export { throwError } from './internal/observable/throwError';
export { timer } from './internal/observable/timer';
export { using } from './internal/observable/using';
export { zip } from './internal/observable/zip';
export { scheduled } from './internal/scheduled/scheduled';

/* Constants */
export { EMPTY } from './internal/observable/empty';
export { NEVER } from './internal/observable/never';

/* Types */
export * from './internal/types';

/* Config */
export { config, GlobalConfig } from './internal/config';
