define(['exports', 'module', '../util/tryCatch', '../util/errorObject', '../Observer', '../ObserverFactory'], function (exports, module, _utilTryCatch, _utilErrorObject, _Observer2, _ObserverFactory2) {
    'use strict';

    module.exports = reduce;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _try_catch = _interopRequireDefault(_utilTryCatch);

    var _error_obj = _interopRequireDefault(_utilErrorObject);

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

    var ReduceObserver = (function (_Observer) {
        function ReduceObserver(destination, processor, initialValue) {
            _classCallCheck(this, ReduceObserver);

            _Observer.call(this, destination);
            this.processor = processor;
            this.aggregate = initialValue;
        }

        _inherits(ReduceObserver, _Observer);

        ReduceObserver.prototype._next = function _next(value) {
            var result = _try_catch['default'](this.processor)(this.aggregate, value);
            if (result === _error_obj['default'].e) {
                this.destination.error(_error_obj['default'].e);
            } else {
                this.aggregate = result;
            }
        };

        ReduceObserver.prototype._complete = function _complete(value) {
            this.destination.next(this.aggregate);
            this.destination.complete(value);
        };

        return ReduceObserver;
    })(_Observer3['default']);

    var ReduceObserverFactory = (function (_ObserverFactory) {
        function ReduceObserverFactory(processor, initialValue) {
            _classCallCheck(this, ReduceObserverFactory);

            _ObserverFactory.call(this);
            this.processor = processor;
            this.initialValue = initialValue;
        }

        _inherits(ReduceObserverFactory, _ObserverFactory);

        ReduceObserverFactory.prototype.create = function create(destination) {
            return new ReduceObserver(destination, this.processor, this.initialValue);
        };

        return ReduceObserverFactory;
    })(_ObserverFactory3['default']);

    function reduce(processor, initialValue) {
        return this.lift(new ReduceObserverFactory(processor, initialValue));
    }
});