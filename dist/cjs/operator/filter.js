'use strict';

exports.__esModule = true;
exports['default'] = select;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observer2 = require('../Observer');

var _Observer3 = _interopRequireDefault(_Observer2);

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _ObserverFactory2 = require('../ObserverFactory');

var _ObserverFactory3 = _interopRequireDefault(_ObserverFactory2);

var FilterObserver = (function (_Observer) {
    function FilterObserver(destination, predicate) {
        _classCallCheck(this, FilterObserver);

        _Observer.call(this, destination);
        this.predicate = predicate;
    }

    _inherits(FilterObserver, _Observer);

    FilterObserver.prototype._next = function _next(value) {
        var result = _utilTryCatch2['default'](this.predicate).call(this, value);
        if (result === _utilErrorObject2['default']) {
            this.destination.error(_utilErrorObject2['default'].e);
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
module.exports = exports['default'];