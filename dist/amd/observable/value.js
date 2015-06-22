define(['exports', 'module', '../Observable'], function (exports, module, _Observable2) {
    'use strict';

    module.exports = value;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var ValueObservable = (function (_Observable) {
        function ValueObservable(value) {
            _classCallCheck(this, ValueObservable);

            _Observable.call(this, null);
            this.value = value;
        }

        _inherits(ValueObservable, _Observable);

        ValueObservable.prototype.subscriber = function subscriber(observer) {
            observer.next(this.value);
            observer['return']();
        };

        return ValueObservable;
    })(_Observable3['default']);

    function value(value) {
        return new ValueObservable(value);
    }

    ;
});