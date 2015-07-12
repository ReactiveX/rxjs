define(['exports', 'module', '../Observable'], function (exports, module, _Observable2) {
    'use strict';

    module.exports = range;

    function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

    var _Observable3 = _interopRequireDefault(_Observable2);

    var RangeObservable = (function (_Observable) {
        function RangeObservable(start, end) {
            _classCallCheck(this, RangeObservable);

            _Observable.call(this, null);
            this.end = end;
            this.start = start;
        }

        _inherits(RangeObservable, _Observable);

        RangeObservable.prototype.subscriber = function subscriber(observer) {
            var end = this.end;
            var start = this.start;
            var i;
            for (i = start; i < end && !observer.unsubscribed; i++) {
                observer.next(i);
            }
            observer.complete();
        };

        return RangeObservable;
    })(_Observable3['default']);

    function range() {
        var start = arguments[0] === undefined ? 0 : arguments[0];
        var end = arguments[1] === undefined ? 0 : arguments[1];

        return new RangeObservable(Math.min(start, end), Math.max(start, end));
    }

    ;
});