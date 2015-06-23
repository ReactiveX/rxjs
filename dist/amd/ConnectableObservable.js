define(['exports', 'module', './Observable', './Observer', './util/Symbol_observer', './scheduler/nextTick'], function (exports, module, _Observable2, _Observer, _utilSymbol_observer, _schedulerNextTick) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _Observer2 = _interopRequireDefault(_Observer);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var _nextTick = _interopRequireDefault(_schedulerNextTick);

    var ConnectableObservable = (function (_Observable) {
        function ConnectableObservable(source, subjectFactory) {
            _classCallCheck(this, ConnectableObservable);

            _Observable.call(this, null);
            this.source = source;
            this.subjectFactory = subjectFactory;
        }

        _inherits(ConnectableObservable, _Observable);

        ConnectableObservable.prototype.connect = function connect() {
            return _nextTick['default'].schedule(0, this, dispatchConnection);
        };

        ConnectableObservable.prototype[_$$observer['default']] = function (observer) {
            if (!(observer instanceof _Observer2['default'])) {
                observer = new _Observer2['default'](observer);
            }
            if (!this.subject || this.subject.unsubscribed) {
                if (this.subscription) {
                    this.subscription = undefined;
                }
                this.subject = this.subjectFactory();
            }
            return this.subject[_$$observer['default']](observer);
        };

        return ConnectableObservable;
    })(_Observable3['default']);

    module.exports = ConnectableObservable;

    function dispatchConnection(connectable) {
        if (!connectable.subscription) {
            if (!connectable.subject) {
                connectable.subject = connectable.subjectFactory();
            }
            connectable.subscription = connectable.source.subscribe(connectable.subject);
        }
        return connectable.subscription;
    }
});