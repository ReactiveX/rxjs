import Subject from './Subject';
import Scheduler from './Scheduler';
import Observable from './Observable';
import Subscriber from './Subscriber';
import Subscription from './Subscription';
import ReplaySubject from './subjects/ReplaySubject';
import BehaviorSubject from './subjects/BehaviorSubject';
import ConnectableObservable from './observables/ConnectableObservable';

import ArrayObservable from './observables/ArrayObservable';
import DeferObservable from './observables/DeferObservable';
import EmptyObservable from './observables/EmptyObservable';
import ErrorObservable from './observables/ErrorObservable';
import InfiniteObservable from './observables/InfiniteObservable';
import IntervalObservable from './observables/IntervalObservable';
import IteratorObservable from './observables/IteratorObservable';
import PromiseObservable from './observables/PromiseObservable';
import RangeObservable from './observables/RangeObservable';
import ScalarObservable from './observables/ScalarObservable';
import TimerObservable from './observables/TimerObservable';
import FromEventPatternObservable from './observables/FromEventPatternObservable';
import FromEventObservable from './observables/FromEventObservable';

Observable.defer = DeferObservable.create;
Observable.from = IteratorObservable.create;
Observable.fromArray = ArrayObservable.create;
Observable.fromPromise = PromiseObservable.create;
Observable.of = ArrayObservable.of;
Observable.range = RangeObservable.create;
Observable.fromEventPattern = FromEventPatternObservable.create;

Observable.just = ScalarObservable.create;
Observable.return = ScalarObservable.create;
Observable.value = ScalarObservable.create;

Observable.throw = ErrorObservable.create;
Observable.empty = EmptyObservable.create;
Observable.never = InfiniteObservable.create;

Observable.timer = TimerObservable.create;
Observable.interval = IntervalObservable.create;
Observable.fromEvent = FromEventObservable.create;

const observableProto = Observable.prototype;

import concat from './operators/concat';
import concatAll from './operators/concatAll';
import concatMap from './operators/concatMap';
import concatMapTo from './operators/concatMapTo';

Observable.concat = concat;
observableProto.concat = concat;
observableProto.concatAll = concatAll;
observableProto.concatMap = concatMap;
observableProto.concatMapTo = concatMapTo;

import merge from './operators/merge';
import mergeAll from './operators/mergeAll';
import flatMap from './operators/flatMap';
import flatMapTo from './operators/flatMapTo';
import switchAll from './operators/switchAll';
import switchLatest from './operators/switchLatest';
import switchLatestTo from './operators/switchLatestTo';

Observable.merge = merge;
observableProto.merge = merge;
observableProto.mergeAll = mergeAll;
observableProto.flatMap = flatMap;
observableProto.flatMapTo = flatMapTo;
observableProto.switchAll = switchAll;
observableProto.switchLatest = switchLatest;
observableProto.switchLatestTo = switchLatestTo;

import map from './operators/map';
import mapTo from './operators/mapTo';
import toArray from './operators/toArray';
import scan from './operators/scan';
import reduce from './operators/reduce';
import startWith from './operators/startWith';

observableProto.map = map;
observableProto.mapTo = mapTo;
observableProto.toArray = toArray;
observableProto.scan = scan;
observableProto.reduce = reduce;
observableProto.startWith = startWith;

import filter from './operators/filter';
import take from './operators/take';
import skip from './operators/skip';
import takeUntil from './operators/takeUntil';

observableProto.take = take;
observableProto.skip = skip;
observableProto.takeUntil = takeUntil;
observableProto.filter = filter;

import combineLatest from './operators/combineLatest';
import combineAll from './operators/combineAll';

Observable.combineLatest = combineLatest;
observableProto.combineLatest = combineLatest;
observableProto.combineAll = combineAll;

import zip from './operators/zip';
import zipAll from './operators/zipAll';

Observable.zip = zip;
observableProto.zip = zip;
observableProto.zipAll = zipAll;

import publish from './operators/publish';
import multicast from './operators/multicast';

observableProto.publish = publish;
observableProto.multicast = multicast;

import observeOn from './operators/observeOn';
import subscribeOn from './operators/subscribeOn';

observableProto.observeOn = observeOn;
observableProto.subscribeOn = subscribeOn;

import partition from './operators/partition';
import toPromise from './operators/toPromise';

observableProto.partition = partition;
observableProto.toPromise = toPromise;

import _catch from './operators/catch';
import retryWhen from './operators/retryWhen';

observableProto.catch = _catch;
observableProto.retryWhen = retryWhen;

export default {
    Subject,
    Scheduler,
    Observable,
    Subscriber,
    Subscription,
    ReplaySubject,
    BehaviorSubject,
    ConnectableObservable
};