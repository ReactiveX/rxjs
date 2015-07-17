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
            this.isUnsubscribed = false;
        }

        _inherits(Subject, _Observable);

        Subject.prototype[_$$observer['default']] = function (subscriber) {
            if (!(subscriber instanceof _Subscriber2['default'])) {
                subscriber = new _Subscriber2['default'](subscriber);
            }
            this.add(subscriber);
            //HACK: return a subscription that will remove the subscriber from the list
            return {
                subscriber: subscriber,
                subject: this,
                isUnsubscribed: false,
                add: function add() {},
                remove: function remove() {},
                unsubscribe: function unsubscribe() {
                    this.isUnsubscribed = true;
                    this.subscriber.unsubscribe;
                    this.subject.remove(this.subscriber);
                }
            };
        };

        Subject.prototype.next = function next(value) {
            if (this.isUnsubscribed) {
                return;
            }
            this.subscribers.forEach(function (o) {
                return o.next(value);
            });
        };

        Subject.prototype.error = function error(err) {
            if (this.isUnsubscribed) {
                return;
            }
            this.subscribers.forEach(function (o) {
                return o.error(err);
            });
            this.unsubscribe();
        };

        Subject.prototype.complete = function complete(value) {
            if (this.isUnsubscribed) {
                return;
            }
            this.subscribers.forEach(function (o) {
                return o.complete(value);
            });
            this.unsubscribe();
        };

        Subject.prototype.add = function add(subscriber) {
            this.subscribers.push(subscriber);
        };

        Subject.prototype.remove = function remove(subscriber) {
            var index = this.subscribers.indexOf(subscriber);
            if (index !== -1) {
                this.subscribers.splice(index, 1);
            }
        };

        Subject.prototype.unsubscribe = function unsubscribe() {
            this.subscribers.length = 0;
            this.isUnsubscribed = true;
        };

        return Subject;
    })(_Observable3['default']);

    module.exports = Subject;
});