define(['exports', 'module', './util/Symbol_observer', './Subscription', './Subject'], function (exports, module, _utilSymbol_observer, _Subscription, _Subject2) {
    'use strict';

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var _Subscription2 = _interopRequireDefault(_Subscription);

    var _Subject3 = _interopRequireDefault(_Subject2);

    var BehaviorSubject = (function (_Subject) {
        function BehaviorSubject(value) {
            _classCallCheck(this, BehaviorSubject);

            _Subject.call(this);
            this.value = value;
        }

        _inherits(BehaviorSubject, _Subject);

        BehaviorSubject.prototype[_$$observer['default']] = function (observer) {
            this.observers.push(observer);
            var subscription = new _Subscription2['default'](null, observer);
            this.next(this.value);
            return subscription;
        };

        BehaviorSubject.prototype.next = function next(value) {
            this.value = value;
            return _Subject.prototype.next.call(this, value);
        };

        return BehaviorSubject;
    })(_Subject3['default']);

    module.exports = BehaviorSubject;
});