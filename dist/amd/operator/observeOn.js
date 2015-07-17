define(['exports', 'module', '../Observer', '../ObserverFactory'], function (exports, module, _Observer2, _ObserverFactory2) {
    'use strict';

    module.exports = observeOn;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

    var ObserveOnObserver = (function (_Observer) {
        function ObserveOnObserver(destination, scheduler) {
            _classCallCheck(this, ObserveOnObserver);

            _Observer.call(this, destination);
            this.scheduler = scheduler;
        }

        _inherits(ObserveOnObserver, _Observer);

        ObserveOnObserver.prototype.next = function next(value) {
            this.scheduler.schedule(0, [this.destination, value], dispatchNext);
        };

        ObserveOnObserver.prototype._error = function _error(err) {
            this.scheduler.schedule(0, [this.destination, err], dispatchError);
        };

        ObserveOnObserver.prototype._complete = function _complete(value) {
            this.scheduler.schedule(0, [this.destination, value], dispatchComplete);
        };

        return ObserveOnObserver;
    })(_Observer3['default']);

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

    var ObserveOnObserverFactory = (function (_ObserverFactory) {
        function ObserveOnObserverFactory(scheduler) {
            _classCallCheck(this, ObserveOnObserverFactory);

            _ObserverFactory.call(this);
            this.scheduler = scheduler;
        }

        _inherits(ObserveOnObserverFactory, _ObserverFactory);

        ObserveOnObserverFactory.prototype.create = function create(destination) {
            return new ObserveOnObserver(destination, this.scheduler);
        };

        return ObserveOnObserverFactory;
    })(_ObserverFactory3['default']);

    function observeOn(scheduler) {
        return this.lift(new ObserveOnObserverFactory(scheduler));
    }
});