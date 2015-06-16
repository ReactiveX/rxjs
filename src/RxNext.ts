import Observable from './Observable';
import Observer from './Observer';
import Scheduler from './Scheduler';
import Subscription from './Subscription';
import CompositeSubscription from './CompositeSubscription';
import SerialSubscription from './SerialSubscription';

import empty from './observable/empty';
import fromArray from './observable/fromArray';
import fromEventPattern from './observable/fromEventPattern';
import fromEvent from './observable/fromEvent';
import _of from './observable/of';
import range from './observable/range';
import _throw from './observable/throw';
import value from './observable/value';

import combine from './operator/combine';
import combineAll from './operator/combineAll';
import merge from './operator/merge';
import mergeAll from './operator/mergeAll';
import select from './operator/select';
import selectMany from './operator/selectMany';
import zip from './operator/zip';
import zipAll from './operator/zipAll';

Observable.combine = combine;
Observable.empty = empty;
Observable.fromArray = fromArray;
Observable.fromEventPattern = fromEventPattern;
Observable.fromEvent = fromEvent;
Observable.value = value;
Observable.of = _of;
Observable.range = range;
Observable.return = value;
Observable.throw = _throw;
Observable.zip = zip;

Observable.prototype.combine = combine;
Observable.prototype.combineAll = combineAll;
Observable.prototype.flatMap = selectMany;
Observable.prototype.map = select;
Observable.prototype.merge = merge;
Observable.prototype.mergeAll = mergeAll;
Observable.prototype.selectMany = selectMany;
Observable.prototype.select = select;
Observable.prototype.zip = zip;
Observable.prototype.zipAll = zipAll;

var RxNext = {
  Scheduler,
  Observer,
  Observable,
  Subscription,
  CompositeSubscription,
  SerialSubscription
};

export default RxNext;