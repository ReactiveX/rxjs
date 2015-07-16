define(['exports', 'module', './Observable', './Subscriber', './util/Symbol_observer'], function (exports, module, _Observable2, _Subscriber, _utilSymbol_observer) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _Subscriber2 = _interopRequireDefault(_Subscriber);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var Subject = (function (_Observable) {
        function Subject() {
            _classCallCheck(this, Subject);

            _Observable.call(this, null);
            this.disposed = false;
            this.subscribers = [];
            this.unsubscribed = false;
        }

        _inherits(Subject, _Observable);

        Subject.prototype.dispose = function dispose() {
            this.disposed = true;
            if (this._dispose) {
                this._dispose();
            }
        };

        Subject.prototype[_$$observer['default']] = function (observer) {
            var subscriber = new _Subscriber2['default'](observer);
            this.subscribers.push(subscriber);
            return subscriber;
        };

        Subject.prototype.next = function next(value) {
            if (this.unsubscribed) {
                return;
            }
            this.subscribers.forEach(function (o) {
                return o.next(value);
            });
            this._cleanUnsubbedSubscribers();
        };

        Subject.prototype.error = function error(err) {
            if (this.unsubscribed) {
                return;
            }
            this.subscribers.forEach(function (o) {
                return o.error(err);
            });
            this.unsubscribe();
            this._cleanUnsubbedSubscribers();
        };

        Subject.prototype.complete = function complete(value) {
            if (this.unsubscribed) {
                return;
            }
            this.subscribers.forEach(function (o) {
                return o.complete(value);
            });
            this.unsubscribe();
            this._cleanUnsubbedSubscribers();
        };

        Subject.prototype._cleanUnsubbedSubscribers = function _cleanUnsubbedSubscribers() {
            var i;
            var subscribers = this.subscribers;
            for (i = subscribers.length; i--;) {
                if (subscribers[i].isUnsubscribed) {
                    subscribers.splice(i, 1);
                }
            }
            if (subscribers.length === 0) {
                this.unsubscribe();
            }
        };

        Subject.prototype.unsubscribe = function unsubscribe() {
            this.subscribers.length = 0;
            this.unsubscribed = true;
        };

        return Subject;
    })(_Observable3['default']);

    module.exports = Subject;
});