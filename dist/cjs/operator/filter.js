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

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscription = require('../Subscription');

var _Subscription2 = _interopRequireDefault(_Subscription);

var FilterObserver = (function (_Observer) {
    function FilterObserver(destination, predicate) {
        _classCallCheck(this, FilterObserver);

        _Observer.call(this, destination);
        this.predicate = predicate;
    }

    _inherits(FilterObserver, _Observer);

    FilterObserver.prototype._next = function _next(value) {
        var result = (0, _utilTryCatch2['default'])(this.predicate).call(this, value);
        if (result === _utilErrorObject2['default']) {
            return this.destination['throw'](_utilErrorObject2['default'].e);
        } else if (Boolean(result)) {
            return this.destination.next(value);
        }
    };

    return FilterObserver;
})(_Observer3['default']);

var FilterObservable = (function (_Observable) {
    function FilterObservable(source, predicate) {
        _classCallCheck(this, FilterObservable);

        _Observable.call(this, null);
        this.source = source;
        this.predicate = predicate;
    }

    _inherits(FilterObservable, _Observable);

    FilterObservable.prototype.subscriber = function subscriber(observer) {
        var filterObserver = new FilterObserver(observer, this.predicate);
        return _Subscription2['default'].from(this.source.subscriber(filterObserver), filterObserver);
    };

    return FilterObservable;
})(_Observable3['default']);

function select(predicate) {
    return new FilterObservable(this, predicate);
}

;
module.exports = exports['default'];