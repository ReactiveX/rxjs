'use strict';

exports.__esModule = true;
exports['default'] = toArray;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observer2 = require('../Observer');

var _Observer3 = _interopRequireDefault(_Observer2);

var _ObserverFactory2 = require('../ObserverFactory');

var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

var ToArrayObserver = (function (_Observer) {
    function ToArrayObserver(destination) {
        _classCallCheck(this, ToArrayObserver);

        _Observer.call(this, destination);
        this.array = [];
    }

    _inherits(ToArrayObserver, _Observer);

    ToArrayObserver.prototype._next = function _next(value) {
        this.array.push(value);
    };

    ToArrayObserver.prototype._complete = function _complete(value) {
        this.destination.next(this.array);
        this.destination.complete(value);
    };

    return ToArrayObserver;
})(_Observer3['default']);

var ToArrayObserverFactory = (function (_ObserverFactory) {
    function ToArrayObserverFactory() {
        _classCallCheck(this, ToArrayObserverFactory);

        _ObserverFactory.apply(this, arguments);
    }

    _inherits(ToArrayObserverFactory, _ObserverFactory);

    ToArrayObserverFactory.prototype.create = function create(destination) {
        return new ToArrayObserver(destination);
    };

    return ToArrayObserverFactory;
})(_ObserverFactory3['default']);

function toArray() {
    return this.lift(new ToArrayObserverFactory());
}

module.exports = exports['default'];