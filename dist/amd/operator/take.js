define(['exports', 'module', '../Observer', '../ObserverFactory'], function (exports, module, _Observer2, _ObserverFactory2) {
    'use strict';

    module.exports = take;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observer3 = _interopRequireDefault(_Observer2);

    var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

    var TakeObserver = (function (_Observer) {
        function TakeObserver(destination, count) {
            _classCallCheck(this, TakeObserver);

            _Observer.call(this, destination);
            this.counter = 0;
            this.count = count;
        }

        _inherits(TakeObserver, _Observer);

        TakeObserver.prototype._next = function _next(value) {
            if (this.counter++ < this.count) {
                this.destination.next(value);
            } else {
                this.destination.complete();
            }
        };

        return TakeObserver;
    })(_Observer3['default']);

    var TakeObserverFactory = (function (_ObserverFactory) {
        function TakeObserverFactory(count) {
            _classCallCheck(this, TakeObserverFactory);

            _ObserverFactory.call(this);
            this.count = count;
        }

        _inherits(TakeObserverFactory, _ObserverFactory);

        TakeObserverFactory.prototype.create = function create(destination) {
            return new TakeObserver(destination, this.count);
        };

        return TakeObserverFactory;
    })(_ObserverFactory3['default']);

    function take(count) {
        return this.lift(new TakeObserverFactory(count));
    }

    ;
});