define(['exports', 'module', './Observable', './util/Symbol_observer'], function (exports, module, _Observable2, _utilSymbol_observer) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var ConnectableObservable = (function (_Observable) {
        function ConnectableObservable(source, subject) {
            _classCallCheck(this, ConnectableObservable);

            _Observable.call(this, null);
            this.source = source;
            this.subject = subject;
        }

        _inherits(ConnectableObservable, _Observable);

        ConnectableObservable.prototype.connect = function connect() {
            if (!this.subscription) {
                this.subscription = this.source.subscribe(this.subject);
            }
            return this.subscription;
        };

        ConnectableObservable.prototype[_$$observer['default']] = function (observer) {
            return this.subject[_$$observer['default']](observer);
        };

        return ConnectableObservable;
    })(_Observable3['default']);

    module.exports = ConnectableObservable;
});