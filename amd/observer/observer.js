define(['exports', 'module'], function (exports, module) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Observer = (function () {
        function Observer(generator, subscriptionDisposable) {
            _classCallCheck(this, Observer);

            this._generator = generator;
            this._subscriptionDisposable = subscriptionDisposable;
        }

        _createClass(Observer, [{
            key: 'next',
            value: function next(value) {
                if (this._subscriptionDisposable.isDisposed) {
                    return;
                }
                var iterationResult = this._generator.next(value);
                if (typeof iterationResult !== 'undefined' && iterationResult.done) {
                    this._subscriptionDisposable.dispose();
                }
                return iterationResult;
            }
        }, {
            key: 'throw',
            value: function _throw(err) {
                if (this._subscriptionDisposable.isDisposed) {
                    return;
                }
                this._subscriptionDisposable.dispose();
                if (this._generator['throw']) {
                    return this._generator['throw'](err);
                }
            }
        }, {
            key: 'return',
            value: function _return(value) {
                if (this._subscriptionDisposable.isDisposed) {
                    return;
                }
                this._subscriptionDisposable.dispose();
                if (this._generator['return']) {
                    return this._generator['return'](value);
                }
            }
        }]);

        return Observer;
    })();

    module.exports = Observer;
});

//# sourceMappingURL=observer.js.map