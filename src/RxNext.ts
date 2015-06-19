import Observable from './Observable';
import Observer from './Observer';
import nextTick from './scheduler/nextTick';
import immediate from './scheduler/immediate';
import NextTickScheduler from './scheduler/NextTickScheduler';
import Scheduler from './scheduler/Scheduler';
import Subscription from './Subscription';
import CompositeSubscription from './CompositeSubscription';
import SerialSubscription from './SerialSubscription';


import value from './observable/value';
import _return from './observable/return';
import fromEventPattern from './observable/fromEventPattern';
import fromEvent from './observable/fromEvent';
import _throw from './observable/throw';
import empty from './observable/empty';
import range from './observable/range';
import fromArray from './observable/fromArray';

import map from './operator/map';
import mapTo from './operator/mapTo';
import mergeAll from './operator/mergeAll';
import flatMap from './operator/flatMap';
import concatAll from './operator/concatAll';
import skip from './operator/skip';
import take from './operator/take';

Observable.value = value;
Observable.return = _return;
Observable.fromEventPattern = fromEventPattern;
Observable.fromEvent = fromEvent;
Observable.throw = _throw;
Observable.empty = empty;
Observable.range = range;
Observable.fromArray = fromArray;

Observable.prototype.map = map;
Observable.prototype.mapTo = mapTo;
Observable.prototype.mergeAll = mergeAll;
Observable.prototype.flatMap = flatMap;
Observable.prototype.concatAll = concatAll;
Observable.prototype.skip = skip;
Observable.prototype.take = take;

var RxNext = {
  Scheduler: {
    nextTick,
    immediate
  },
  Observer,
  Observable,
  Subscription,
  CompositeSubscription,
  SerialSubscription
};

export default RxNext;