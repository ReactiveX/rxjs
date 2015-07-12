define(['exports', 'module', '../Observable', '../util/Symbol_observer'], function (exports, module, _Observable2, _utilSymbol_observer) {
    'use strict';

    module.exports = _throw;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var _$$observer = _interopRequireDefault(_utilSymbol_observer);

    var ThrowObservable = (function (_Observable) {
        function ThrowObservable(err) {
            _classCallCheck(this, ThrowObservable);

            _Observable.call(this, null);
            this.err = err;
        }

        _inherits(ThrowObservable, _Observable);

        ThrowObservable.prototype[_$$observer['default']] = function (observer) {
            observer.error(this.err);
        };

        return ThrowObservable;
    })(_Observable3['default']);

    var EMPTY_THROW = new ThrowObservable(undefined);

    function _throw() {
        var err = arguments[0] === undefined ? undefined : arguments[0];

        return err ? new ThrowObservable(err) : EMPTY_THROW;
    }

    ;
});