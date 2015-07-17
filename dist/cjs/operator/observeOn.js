'use strict';

exports.__esModule = true;
exports['default'] = observeOn;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Subscriber2 = require('../Subscriber');

var _Subscriber3 = _interopRequireDefault(_Subscriber2);

var _SubscriberFactory2 = require('../SubscriberFactory');

var _SubscriberFactory3 = _interopRequireDefault(_SubscriberFactory2);

var ObserveOnSubscriber = (function (_Subscriber) {
    function ObserveOnSubscriber(destination, scheduler) {
        _classCallCheck(this, ObserveOnSubscriber);

        _Subscriber.call(this, destination);
        this.scheduler = scheduler;
    }

    _inherits(ObserveOnSubscriber, _Subscriber);

    ObserveOnSubscriber.prototype.next = function next(value) {
        this.scheduler.schedule(0, [this.destination, value], dispatchNext);
    };

    ObserveOnSubscriber.prototype._error = function _error(err) {
        this.scheduler.schedule(0, [this.destination, err], dispatchError);
    };

    ObserveOnSubscriber.prototype._complete = function _complete(value) {
        this.scheduler.schedule(0, [this.destination, value], dispatchComplete);
    };

    return ObserveOnSubscriber;
})(_Subscriber3['default']);

function dispatchNext(_ref) {
    var destination = _ref[0];
    var value = _ref[1];

    var result = destination.next(value);
    if (result.done) {
        destination.dispose();
    }
}
function dispatchError(_ref2) {
    var destination = _ref2[0];
    var err = _ref2[1];

    var result = destination.error(err);
    destination.dispose();
}
function dispatchComplete(_ref3) {
    var destination = _ref3[0];
    var value = _ref3[1];

    var result = destination.complete(value);
    destination.dispose();
}

var ObserveOnSubscriberFactory = (function (_SubscriberFactory) {
    function ObserveOnSubscriberFactory(scheduler) {
        _classCallCheck(this, ObserveOnSubscriberFactory);

        _SubscriberFactory.call(this);
        this.scheduler = scheduler;
    }

    _inherits(ObserveOnSubscriberFactory, _SubscriberFactory);

    ObserveOnSubscriberFactory.prototype.create = function create(destination) {
        return new ObserveOnSubscriber(destination, this.scheduler);
    };

    return ObserveOnSubscriberFactory;
})(_SubscriberFactory3['default']);

function observeOn(scheduler) {
    return this.lift(new ObserveOnSubscriberFactory(scheduler));
}

module.exports = exports['default'];