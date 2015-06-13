import Observable from './Observable';
import Observer from './Observer';
import Scheduler from './Scheduler';
import Subscription from './Subscription';
import CompositeSubscription from './CompositeSubscription';
import SerialSubscription from './SerialSubscription';


import value from './observable/value';
import fromEventPattern from './observable/fromEventPattern';
import fromEvent from './observable/fromEvent';
import _throw from './observable/throw';
import empty from './observable/empty';
import range from './observable/range';

import select from './operator/select';
import mergeAll from './operator/mergeAll';
import selectMany from './operator/selectMany';

Observable.value = value;
Observable.return = value;
Observable.fromEventPattern = fromEventPattern;
Observable.fromEvent = fromEvent;
Observable.throw = _throw;
Observable.empty = empty;
Observable.range = range;

Observable.prototype.select = select;
Observable.prototype.map = select;
Observable.prototype.mergeAll = mergeAll;
Observable.prototype.selectMany = selectMany;
Observable.prototype.flatMap = selectMany;

var RxNext = {
  Scheduler,
  Observer,
  Observable,
  Subscription,
  CompositeSubscription,
  SerialSubscription
};

export default RxNext;