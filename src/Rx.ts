import Observable from './Observable';

// operators
import combineLatestStatic from './operators/combineLatest-static';
Observable.combineLatest = combineLatestStatic;

import concatStatic from './operators/concat-static';
Observable.concat = concatStatic;

import DeferObservable from './observables/DeferObservable';
Observable.defer = DeferObservable.create;

import EmptyObservable from './observables/EmptyObservable';
Observable.empty = EmptyObservable.create;

import ForkJoinObservable from './observables/ForkJoinObservable';
Observable.forkJoin = ForkJoinObservable.create;

import FromObservable from './observables/FromObservable';
Observable.from = FromObservable.create;

import ArrayObservable from './observables/ArrayObservable';
Observable.fromArray = ArrayObservable.create;

import FromEventObservable from './observables/FromEventObservable';
Observable.fromEvent = FromEventObservable.create;

import FromEventPatternObservable from './observables/FromEventPatternObservable';
Observable.fromEventPattern = FromEventPatternObservable.create;

import PromiseObservable from './observables/PromiseObservable';
Observable.fromPromise = PromiseObservable.create;

import IntervalObservable from './observables/IntervalObservable';
Observable.interval = IntervalObservable.create;

import mergeStatic from './operators/merge-static';
Observable.merge = mergeStatic;

import InfiniteObservable from './observables/InfiniteObservable';
Observable.never = InfiniteObservable.create;

Observable.of = ArrayObservable.of;

import RangeObservable from './observables/RangeObservable';
Observable.range = RangeObservable.create;

import ErrorObservable from './observables/ErrorObservable';
Observable.throw = ErrorObservable.create;

import TimerObservable from './observables/TimerObservable';
Observable.timer = TimerObservable.create;

import zipStatic from './operators/zip-static';
Observable.zip = zipStatic;

// Operators
import { CoreOperators } from './CoreOperators';
const observableProto = (<CoreOperators<any>>Observable.prototype);

import buffer from './operators/buffer';
observableProto.buffer = buffer;

import bufferCount from './operators/bufferCount';
observableProto.bufferCount = bufferCount;

import bufferTime from './operators/bufferTime';
observableProto.bufferTime = bufferTime;

import bufferToggle from './operators/bufferToggle';
observableProto.bufferToggle = bufferToggle;

import bufferWhen from './operators/bufferWhen';
observableProto.bufferWhen = bufferWhen;

import _catch from './operators/catch';
observableProto.catch = _catch;

import combineAll from './operators/combineAll';
observableProto.combineAll = combineAll;

import combineLatest from './operators/combineLatest';
observableProto.combineLatest = combineLatest;

import concat from './operators/concat';
observableProto.concat = concat;

import concatAll from './operators/concatAll';
observableProto.concatAll = concatAll;

import concatMap from './operators/concatMap';
observableProto.concatMap = concatMap;

import concatMapTo from './operators/concatMapTo';
observableProto.concatMapTo = concatMapTo;

import count from './operators/count';
observableProto.count = count;

import dematerialize from './operators/dematerialize';
observableProto.dematerialize = dematerialize;

import debounce from './operators/debounce';
observableProto.debounce = debounce;

import debounceTime from './operators/debounceTime';
observableProto.debounceTime = debounceTime;

import defaultIfEmpty from './operators/defaultIfEmpty';
observableProto.defaultIfEmpty = defaultIfEmpty;

import delay from './operators/delay';
observableProto.delay = delay;

import distinctUntilChanged from './operators/distinctUntilChanged';
observableProto.distinctUntilChanged = distinctUntilChanged;

import _do from './operators/do';
observableProto.do = _do;

import expand from './operators/expand';
observableProto.expand = expand;

import filter from './operators/filter';
observableProto.filter = filter;

import _finally from './operators/finally';
observableProto.finally = _finally;

import first from './operators/first';
observableProto.first = first;

import {groupBy} from './operators/groupBy';
observableProto.groupBy = groupBy;

import ignoreElements from './operators/ignoreElements';
observableProto.ignoreElements = ignoreElements;

import every from './operators/every';
observableProto.every = every;

import last from './operators/last';
observableProto.last = last;

import map from './operators/map';
observableProto.map = map;

import mapTo from './operators/mapTo';
observableProto.mapTo = mapTo;

import materialize from './operators/materialize';
observableProto.materialize = materialize;

import merge from './operators/merge';
observableProto.merge = merge;

import mergeAll from './operators/mergeAll';
observableProto.mergeAll = mergeAll;

import mergeMap from './operators/mergeMap';
observableProto.mergeMap = mergeMap;
observableProto.flatMap = mergeMap;

import mergeMapTo from './operators/mergeMapTo';
observableProto.mergeMapTo = mergeMapTo;
observableProto.flatMapTo = mergeMapTo;

import multicast from './operators/multicast';
observableProto.multicast = multicast;

import observeOn from './operators/observeOn';
observableProto.observeOn = observeOn;

import partition from './operators/partition';
observableProto.partition = partition;

import publish from './operators/publish';
observableProto.publish = publish;

import publishBehavior from './operators/publishBehavior';
observableProto.publishBehavior = publishBehavior;

import publishReplay from './operators/publishReplay';
observableProto.publishReplay = publishReplay;

import reduce from './operators/reduce';
observableProto.reduce = reduce;

import repeat from './operators/repeat';
observableProto.repeat = repeat;

import retry from './operators/retry';
observableProto.retry = retry;

import retryWhen from './operators/retryWhen';
observableProto.retryWhen = retryWhen;

import sample from './operators/sample';
observableProto.sample = sample;

import sampleTime from './operators/sampleTime';
observableProto.sampleTime = sampleTime;

import scan from './operators/scan';
observableProto.scan = scan;

import share from './operators/share';
observableProto.share = share;

import shareReplay from './operators/shareReplay';
observableProto.shareReplay = shareReplay;

import single from './operators/single';
observableProto.single = single;

import skip from './operators/skip';
observableProto.skip = skip;

import skipUntil from './operators/skipUntil';
observableProto.skipUntil = skipUntil;

import startWith from './operators/startWith';
observableProto.startWith = startWith;

import subscribeOn from './operators/subscribeOn';
observableProto.subscribeOn = subscribeOn;

import _switch from './operators/switch';
observableProto.switch = _switch;

import switchMap from './operators/switchMap';
observableProto.switchMap = switchMap;

import switchMapTo from './operators/switchMapTo';
observableProto.switchMapTo = switchMapTo;

import take from './operators/take';
observableProto.take = take;

import takeUntil from './operators/takeUntil';
observableProto.takeUntil = takeUntil;

import throttle from './operators/throttle';
observableProto.throttle = throttle;

import timeout from './operators/timeout';
observableProto.timeout = timeout;

import timeoutWith from './operators/timeoutWith';
observableProto.timeoutWith = timeoutWith;

import toArray from './operators/toArray';
observableProto.toArray = toArray;

import toPromise from './operators/toPromise';
observableProto.toPromise = toPromise;

import window from './operators/window';
observableProto.window = window;

import windowCount from './operators/windowCount';
observableProto.windowCount = windowCount;

import windowTime from './operators/windowTime';
observableProto.windowTime = windowTime;

import windowToggle from './operators/windowToggle';
observableProto.windowToggle = windowToggle;

import windowWhen from './operators/windowWhen';
observableProto.windowWhen = windowWhen;

import withLatestFrom from './operators/withLatestFrom';
observableProto.withLatestFrom = withLatestFrom;

import zip from './operators/zip';
observableProto.zip = zip;

import zipAll from './operators/zipAll';
observableProto.zipAll = zipAll;

import Subject from './Subject';
import Subscription from './Subscription';
import Subscriber from './Subscriber';
import ReplaySubject from './subjects/ReplaySubject';
import BehaviorSubject from './subjects/BehaviorSubject';
import ConnectableObservable from './observables/ConnectableObservable';
import Notification from './Notification';
import EmptyError from './util/EmptyError';
import ArgumentOutOfRangeError from './util/ArgumentOutOfRangeError';
import nextTick from './schedulers/nextTick';
import immediate from './schedulers/immediate';
import NextTickScheduler from './schedulers/NextTickScheduler';
import ImmediateScheduler from './schedulers/ImmediateScheduler';

var Scheduler = {
  nextTick,
  immediate
};

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
