define(['exports', 'module', '../util/tryCatch', '../util/errorObject', '../Observable', '../Observer', '../Subscription'], function (exports, module, _utilTryCatch, _utilErrorObject, _Observable2, _Observer2, _Subscription) {
    'use strict';

    module.exports = reduce;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _try_catch = _interopRequireDefault(_utilTryCatch);

    var _error_obj = _interopRequireDefault(_utilErrorObject);

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _Subscription2 = _interopRequireDefault(_Subscription);

    var ReduceObserver = (function (_Observer) {
        function ReduceObserver(destination, processor, initialValue) {
            _classCallCheck(this, ReduceObserver);

            _Observer.call(this, destination);
            this.processor = processor;
            this.aggregate = initialValue;
        }

        _inherits(ReduceObserver, _Observer);

        ReduceObserver.prototype._next = function _next(value) {
            var result = (0, _try_catch['default'])(this.processor)(this.aggregate, value);
            if (result === _error_obj['default'].e) {
                this.destination['throw'](_error_obj['default'].e);
            } else {
                this.aggregate = result;
            }
            return { done: false };
        };

        ReduceObserver.prototype._return = function _return(value) {
            this.destination.next(this.aggregate);
            return this.destination['return'](value);
        };

        return ReduceObserver;
    })(_Observer3['default']);

    var ReduceObservable = (function (_Observable) {
        function ReduceObservable(source, processor, initialValue) {
            _classCallCheck(this, ReduceObservable);

            _Observable.call(this, null);
            this.source = source;
            this.processor = processor;
            this.initialValue = initialValue;
        }

        _inherits(ReduceObservable, _Observable);

        ReduceObservable.prototype.subscriber = function subscriber(observer) {
            var reduceObserver = new ReduceObserver(observer, this.processor, this.initialValue);
            return _Subscription2['default'].from(this.source.subscriber(reduceObserver), reduceObserver);
        };

        return ReduceObservable;
    })(_Observable3['default']);

    function reduce(processor, initialValue) {
        return new ReduceObservable(this, processor, initialValue);
    }
});