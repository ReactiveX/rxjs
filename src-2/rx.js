import Disposable from './Disposable';
import Observable from './Observable';
import Subscriber from './Subscriber';

import create from './observable/create';
import extend from './observable/extend';
import defer from './observable/defer';
import empty from './observable/empty';
import error from './observable/error';
import fromArray from './observable/fromArray';
import interval from './observable/interval';
import never from './observable/never';
import range from './observable/range';
import value from './observable/value';

Observable.create    = create;
Observable.extend    = extend;
Observable.defer     = defer;
Observable.empty     = empty;
Observable.error     = error;
Observable.throw     = error;
Observable.fromArray = fromArray;
Observable.interval  = interval;
Observable.never     = never;
Observable.range     = range;
Observable.value     = value;
Observable.return    = value;

import letBind      from './operators/let';
import map          from './operators/map';
import filter       from './operators/filter';
import scan         from './operators/scan';
import reduce       from './operators/reduce';
import take         from './operators/take';
import timeInterval from './operators/time-interval';
import toArray      from './operators/to-array';
import concatAll    from './operators/concat-all';
import mergeAll     from './operators/merge-all';
import flatMap      from './operators/flat-map';

Observable.prototype.let          = letBind;
Observable.prototype.map          = extend(map);
Observable.prototype.map2         = extend(map);

Observable.prototype.filter       = extend(filter);
Observable.prototype.scan         = extend(scan);
Observable.prototype.reduce       = extend(reduce);
Observable.prototype.take         = extend(take);
Observable.prototype.timeInterval = extend(timeInterval);
Observable.prototype.toArray      = extend(toArray);
Observable.prototype.concatAll    = extend(concatAll);
Observable.prototype.mergeAll     = extend(mergeAll);
Observable.prototype.flatMap      = extend(flatMap);
Observable.prototype.flatMap2     = extend(flatMap);

export default {
    Disposable: Disposable,
    Observable: Observable,
    Subscriber: Subscriber
};