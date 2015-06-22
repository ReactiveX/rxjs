'use strict';

exports.__esModule = true;
exports['default'] = fromPromise;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var PromiseObservable = (function (_Observable) {
    function PromiseObservable(promise) {
        _classCallCheck(this, PromiseObservable);

        _Observable.call(this, null);
        this.promise = promise;
    }

    _inherits(PromiseObservable, _Observable);

    PromiseObservable.prototype.subscriber = function subscriber(observer) {
        var promise = this.promise;
        if (promise) {
            promise.then(function (x) {
                if (!observer.unsubscribed) {
                    observer.next(x);
                    observer['return'](x);
                }
            });
        }
    };

    return PromiseObservable;
})(_Observable3['default']);

function fromPromise(promise) {
    return new PromiseObservable(promise);
}

module.exports = exports['default'];