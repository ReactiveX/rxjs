import {Observable} from './Observable';

// operators
/* tslint:disable:no-use-before-declare */
import {combineLatest as combineLatestStatic} from './operators/combineLatest-static';
Observable.combineLatest = combineLatestStatic;

import {concat as concatStatic} from './operators/concat-static';
Observable.concat = concatStatic;

import {merge as mergeStatic} from './operators/merge-static';
Observable.merge = mergeStatic;
/* tslint:enable:no-use-before-declare */

import {DeferObservable} from './observables/DeferObservable';
Observable.defer = DeferObservable.create;

import {EmptyObservable} from './observables/EmptyObservable';
Observable.empty = EmptyObservable.create;

import {ForkJoinObservable} from './observables/ForkJoinObservable';
Observable.forkJoin = ForkJoinObservable.create;

import {FromObservable} from './observables/FromObservable';
Observable.from = FromObservable.create;

import {ArrayObservable} from './observables/ArrayObservable';
Observable.fromArray = ArrayObservable.create;

import {FromEventObservable} from './observables/FromEventObservable';
Observable.fromEvent = FromEventObservable.create;

import {FromEventPatternObservable} from './observables/FromEventPatternObservable';
Observable.fromEventPattern = FromEventPatternObservable.create;

import {PromiseObservable} from './observables/PromiseObservable';
Observable.fromPromise = PromiseObservable.create;

import {CallbackObservable} from './observables/CallbackObservable';
Observable.fromCallback = CallbackObservable.create;

import {IntervalObservable} from './observables/IntervalObservable';
Observable.interval = IntervalObservable.create;

import {InfiniteObservable} from './observables/InfiniteObservable';
Observable.never = InfiniteObservable.create;

Observable.of = ArrayObservable.of;

import {RangeObservable} from './observables/RangeObservable';
Observable.range = RangeObservable.create;

import {ErrorObservable} from './observables/ErrorObservable';
Observable.throw = ErrorObservable.create;

import {TimerObservable} from './observables/TimerObservable';
Observable.timer = TimerObservable.create;

import {zip as zipStatic} from './operators/zip-static';
Observable.zip = zipStatic;

//operators
import './operators/buffer';
import './operators/bufferCount';
import './operators/bufferTime';
import './operators/bufferToggle';
import './operators/bufferWhen';
import './operators/catch';
import './operators/combineAll';
import './operators/combineLatest';
import './operators/concat';
import './operators/concatAll';
import './operators/concatMap';
import './operators/concatMapTo';
import './operators/count';
import './operators/dematerialize';
import './operators/debounce';
import './operators/debounceTime';
import './operators/defaultIfEmpty';
import './operators/delay';
import './operators/distinctUntilChanged';
import './operators/do';
import './operators/expand';
import './operators/filter';
import './operators/finally';
import './operators/first';
import './operators/groupBy';
import './operators/ignoreElements';
import './operators/every';
import './operators/last';
import './operators/map';
import './operators/mapTo';
import './operators/materialize';
import './operators/merge';
import './operators/mergeAll';
import './operators/mergeMap';
import './operators/mergeMapTo';
import './operators/multicast';
import './operators/observeOn';
import './operators/partition';
import './operators/publish';
import './operators/publishBehavior';
import './operators/publishReplay';
import './operators/reduce';
import './operators/repeat';
import './operators/retry';
import './operators/retryWhen';
import './operators/sample';
import './operators/sampleTime';
import './operators/scan';
import './operators/share';
import './operators/single';
import './operators/skip';
import './operators/skipUntil';
import './operators/skipWhile';
import './operators/startWith';
import './operators/subscribeOn';
import './operators/switch';
import './operators/switchFirst';
import './operators/switchMap';
import './operators/switchMapFirst';
import './operators/switchMapTo';
import './operators/take';
import './operators/takeUntil';
import './operators/takeWhile';
import './operators/throttle';
import './operators/throttleTime';
import './operators/timeout';
import './operators/timeoutWith';
import './operators/toArray';
import './operators/toPromise';
import './operators/window';
import './operators/windowCount';
import './operators/windowTime';
import './operators/windowToggle';
import './operators/windowWhen';
import './operators/withLatestFrom';
import './operators/zip';
import './operators/zipAll';

/* tslint:disable:no-unused-variable */
import {Subject} from './Subject';
import {Subscription} from './Subscription';
import {Subscriber} from './Subscriber';
import {ReplaySubject} from './subjects/ReplaySubject';
import {BehaviorSubject} from './subjects/BehaviorSubject';
import {ConnectableObservable} from './observables/ConnectableObservable';
import {Notification} from './Notification';
import {EmptyError} from './util/EmptyError';
import {ArgumentOutOfRangeError} from './util/ArgumentOutOfRangeError';
import {nextTick} from './schedulers/nextTick';
import {immediate} from './schedulers/immediate';
import {NextTickScheduler} from './schedulers/NextTickScheduler';
import {ImmediateScheduler} from './schedulers/ImmediateScheduler';
/* tslint:enable:no-unused-variable */

/* tslint:disable:no-var-keyword */
var Scheduler = {
  nextTick,
  immediate
};
/* tslint:enable:no-var-keyword */

export {
    Subject,
    Scheduler,
    Observable,
    Subscriber,
    Subscription,
    ReplaySubject,
    BehaviorSubject,
    ConnectableObservable,
    Notification,
    EmptyError,
    ArgumentOutOfRangeError
};
