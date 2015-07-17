'use strict';

exports.__esModule = true;
exports['default'] = reduce;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _Observer2 = require('../Observer');

var _Observer3 = _interopRequireDefault(_Observer2);

var _ObserverFactory2 = require('../ObserverFactory');

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
        var result = _utilTryCatch2['default'](this.processor)(this.aggregate, value);
        if (result === _utilErrorObject2['default'].e) {
            this.destination.error(_utilErrorObject2['default'].e);
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

module.exports = exports['default'];