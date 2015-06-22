'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Observable = require('./Observable');

var _Observable2 = _interopRequireDefault(_Observable);

var _Observer = require('./Observer');

var _Observer2 = _interopRequireDefault(_Observer);

var _schedulerNextTick = require('./scheduler/nextTick');

var _schedulerNextTick2 = _interopRequireDefault(_schedulerNextTick);

var _schedulerImmediate = require('./scheduler/immediate');

var _schedulerImmediate2 = _interopRequireDefault(_schedulerImmediate);

var _Subscription = require('./Subscription');

var _Subscription2 = _interopRequireDefault(_Subscription);

var _CompositeSubscription = require('./CompositeSubscription');

var _CompositeSubscription2 = _interopRequireDefault(_CompositeSubscription);

var _SerialSubscription = require('./SerialSubscription');

var _SerialSubscription2 = _interopRequireDefault(_SerialSubscription);

var _Subject = require('./Subject');

var _Subject2 = _interopRequireDefault(_Subject);

var _observableValue = require('./observable/value');

var _observableValue2 = _interopRequireDefault(_observableValue);

var _observableReturn = require('./observable/return');

var _observableReturn2 = _interopRequireDefault(_observableReturn);

var _observableFromEventPattern = require('./observable/fromEventPattern');

var _observableFromEventPattern2 = _interopRequireDefault(_observableFromEventPattern);

var _observableFromEvent = require('./observable/fromEvent');

var _observableFromEvent2 = _interopRequireDefault(_observableFromEvent);

var _observableThrow = require('./observable/throw');

var _observableThrow2 = _interopRequireDefault(_observableThrow);

var _observableEmpty = require('./observable/empty');

var _observableEmpty2 = _interopRequireDefault(_observableEmpty);

var _observableRange = require('./observable/range');

var _observableRange2 = _interopRequireDefault(_observableRange);

var _observableFromArray = require('./observable/fromArray');

var _observableFromArray2 = _interopRequireDefault(_observableFromArray);

var _observableZip = require('./observable/zip');

var _observableZip2 = _interopRequireDefault(_observableZip);

var _observableFromPromise = require('./observable/fromPromise');

var _observableFromPromise2 = _interopRequireDefault(_observableFromPromise);

var _operatorMap = require('./operator/map');

var _operatorMap2 = _interopRequireDefault(_operatorMap);

var _operatorMapTo = require('./operator/mapTo');

var _operatorMapTo2 = _interopRequireDefault(_operatorMapTo);

var _operatorMergeAll = require('./operator/mergeAll');

var _operatorMergeAll2 = _interopRequireDefault(_operatorMergeAll);

var _operatorFlatMap = require('./operator/flatMap');

var _operatorFlatMap2 = _interopRequireDefault(_operatorFlatMap);

var _operatorConcatAll = require('./operator/concatAll');

var _operatorConcatAll2 = _interopRequireDefault(_operatorConcatAll);

var _operatorSkip = require('./operator/skip');

var _operatorSkip2 = _interopRequireDefault(_operatorSkip);

var _operatorTake = require('./operator/take');

var _operatorTake2 = _interopRequireDefault(_operatorTake);

var _operatorSubscribeOn = require('./operator/subscribeOn');

var _operatorSubscribeOn2 = _interopRequireDefault(_operatorSubscribeOn);

var _operatorObserveOn = require('./operator/observeOn');

var _operatorObserveOn2 = _interopRequireDefault(_operatorObserveOn);

var _operatorZipAll = require('./operator/zipAll');

var _operatorZipAll2 = _interopRequireDefault(_operatorZipAll);

var _operatorZip = require('./operator/zip');

var _operatorZip2 = _interopRequireDefault(_operatorZip);

var _operatorMerge = require('./operator/merge');

var _operatorMerge2 = _interopRequireDefault(_operatorMerge);

_Observable2['default'].value = _observableValue2['default'];
_Observable2['default']['return'] = _observableReturn2['default'];
_Observable2['default'].fromEventPattern = _observableFromEventPattern2['default'];
_Observable2['default'].fromEvent = _observableFromEvent2['default'];
_Observable2['default']['throw'] = _observableThrow2['default'];
_Observable2['default'].empty = _observableEmpty2['default'];
_Observable2['default'].range = _observableRange2['default'];
_Observable2['default'].fromArray = _observableFromArray2['default'];
_Observable2['default'].zip = _observableZip2['default'];
_Observable2['default'].fromPromise = _observableFromPromise2['default'];
_Observable2['default'].prototype.map = _operatorMap2['default'];
_Observable2['default'].prototype.mapTo = _operatorMapTo2['default'];
_Observable2['default'].prototype.mergeAll = _operatorMergeAll2['default'];
_Observable2['default'].prototype.flatMap = _operatorFlatMap2['default'];
_Observable2['default'].prototype.concatAll = _operatorConcatAll2['default'];
_Observable2['default'].prototype.skip = _operatorSkip2['default'];
_Observable2['default'].prototype.take = _operatorTake2['default'];
_Observable2['default'].prototype.subscribeOn = _operatorSubscribeOn2['default'];
_Observable2['default'].prototype.observeOn = _operatorObserveOn2['default'];
_Observable2['default'].prototype.zipAll = _operatorZipAll2['default'];
_Observable2['default'].prototype.zip = _operatorZip2['default'];
_Observable2['default'].prototype.merge = _operatorMerge2['default'];
var RxNext = {
    Scheduler: {
        nextTick: _schedulerNextTick2['default'],
        immediate: _schedulerImmediate2['default']
    },
    Observer: _Observer2['default'],
    Observable: _Observable2['default'],
    Subscription: _Subscription2['default'],
    CompositeSubscription: _CompositeSubscription2['default'],
    SerialSubscription: _SerialSubscription2['default'],
    Subject: _Subject2['default']
};
exports['default'] = RxNext;
module.exports = exports['default'];