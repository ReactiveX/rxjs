var Disposable = require("src/Disposable");
var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");
var Scheduler  = require("src/Scheduler");

var of    = require("src/observable/of");
var from  = require("src/observable/from");
var defer = require("src/observable/defer");
var empty = require("src/observable/empty");
var error = require("src/observable/error");
var fromArray = require("src/observable/from-array");
var fromNodeCallback = require("src/observable/from-node-callback");
var interval = require("src/observable/interval");
var never = require("src/observable/never");
var range = require("src/observable/range");
var value = require("src/observable/value");

Observable.of        = of;
Observable.from      = from;
Observable.defer     = defer;
Observable.empty     = empty;
Observable.error     = error;
Observable.throw     = error;
Observable.fromArray = fromArray;
Observable.fromNodeCallback = fromNodeCallback;
Observable.interval  = interval;
Observable.never     = never;
Observable.range     = range;
Observable.value     = value;
Observable.return    = value;

var concat       = require("src/operators/concat");
var concatAll    = require("src/operators/concat-all");
var concatMap    = require("src/operators/concat-map");
var count        = require("src/operators/count");
var letBind      = require("src/operators/let");
var map          = require("src/operators/map");
var filter       = require("src/operators/filter");
var scan         = require("src/operators/scan");
var reduce       = require("src/operators/reduce");
var take         = require("src/operators/take");
var timeInterval = require("src/operators/time-interval");
var toArray      = require("src/operators/to-array");
var merge        = require("src/operators/merge");
var mergeAll     = require("src/operators/merge-all");
var flatMap      = require("src/operators/flat-map");

Observable.prototype.count        = count;
Observable.prototype.let          = letBind;
Observable.prototype.map          = map;
Observable.prototype.filter       = filter;
Observable.prototype.scan         = scan;
Observable.prototype.reduce       = reduce;
Observable.prototype.take         = take;
Observable.prototype.timeInterval = timeInterval;
Observable.prototype.toArray      = toArray;
Observable.prototype.concat       = concat;
Observable.prototype.concatAll    = concatAll;
Observable.prototype.concatMap    = concatMap;
Observable.prototype.merge        = merge;
Observable.prototype.mergeAll     = mergeAll;
Observable.prototype.flatMap      = flatMap;

module.exports = {
    Disposable: Disposable,
    Observable: Observable,
    Subscriber: Subscriber,
    Scheduler : Scheduler
};