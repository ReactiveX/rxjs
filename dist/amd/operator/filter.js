define(['exports', 'module', '../Observer', '../util/tryCatch', '../util/errorObject', '../ObserverFactory'], function (exports, module, _Observer2, _utilTryCatch, _utilErrorObject, _ObserverFactory2) {
    'use strict';

    module.exports = select;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _try_catch = _interopRequireDefault(_utilTryCatch);

    var _error_obj = _interopRequireDefault(_utilErrorObject);

    var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

    var FilterObserver = (function (_Observer) {
        function FilterObserver(destination, predicate) {
            _classCallCheck(this, FilterObserver);

            _Observer.call(this, destination);
            this.predicate = predicate;
        }

        _inherits(FilterObserver, _Observer);

        FilterObserver.prototype._next = function _next(value) {
            var result = _try_catch['default'](this.predicate).call(this, value);
            if (result === _error_obj['default']) {
                this.destination.error(_error_obj['default'].e);
            } else if (Boolean(result)) {
                this.destination.next(value);
            }
        };

        return FilterObserver;
    })(_Observer3['default']);

    var FilterObserverFactory = (function (_ObserverFactory) {
        function FilterObserverFactory(predicate) {
            _classCallCheck(this, FilterObserverFactory);

            _ObserverFactory.call(this);
            this.predicate = predicate;
        }

        _inherits(FilterObserverFactory, _ObserverFactory);

        FilterObserverFactory.prototype.create = function create(destination) {
            return new FilterObserver(destination, this.predicate);
        };

        return FilterObserverFactory;
    })(_ObserverFactory3['default']);

    function select(predicate) {
        return this.lift(new FilterObserverFactory(predicate));
    }

    ;
});