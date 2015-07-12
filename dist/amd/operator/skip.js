define(['exports', 'module', '../Observer', '../ObserverFactory'], function (exports, module, _Observer2, _ObserverFactory2) {
    'use strict';

    module.exports = skip;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

    var SkipObserver = (function (_Observer) {
        function SkipObserver(destination, count) {
            _classCallCheck(this, SkipObserver);

            _Observer.call(this, destination);
            this.counter = 0;
            this.count = count;
        }

        _inherits(SkipObserver, _Observer);

        SkipObserver.prototype._next = function _next(value) {
            if (this.counter++ >= this.count) {
                return this.destination.next(value);
            }
        };

        return SkipObserver;
    })(_Observer3['default']);

    var SkipObserverFactory = (function (_ObserverFactory) {
        function SkipObserverFactory(count) {
            _classCallCheck(this, SkipObserverFactory);

            _ObserverFactory.call(this);
            this.count = count;
        }

        _inherits(SkipObserverFactory, _ObserverFactory);

        SkipObserverFactory.prototype.create = function create(destination) {
            return new SkipObserver(destination, this.count);
        };

        return SkipObserverFactory;
    })(_ObserverFactory3['default']);

    function skip(count) {
        return this.lift(new SkipObserverFactory(count));
    }

    ;
});