define(['exports', 'module', '../Observable'], function (exports, module, _Observable2) {
    'use strict';

    module.exports = _return;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var ReturnObservable = (function (_Observable) {
        function ReturnObservable(returnValue) {
            _classCallCheck(this, ReturnObservable);

            _Observable.call(this, null);
            this.returnValue = returnValue;
        }

        _inherits(ReturnObservable, _Observable);

        ReturnObservable.prototype.subscriber = function subscriber(_subscriber) {
            _subscriber.complete(this.returnValue);
        };

        return ReturnObservable;
    })(_Observable3['default']);

    function _return() {
        var returnValue = arguments[0] === undefined ? undefined : arguments[0];

        return new ReturnObservable(returnValue);
    }
});