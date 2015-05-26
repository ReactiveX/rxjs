define(['exports', 'module'], function (exports, module) {
    'use strict';

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    var Observer = (function () {
        function Observer(generator, subscriptionDisposable) {
            _classCallCheck(this, Observer);

            this[Symbol.toStringTag] = '[object RxJS.Observer]';
            this.generator = generator;
            this.subscription = subscriptionDisposable;
        }

        _createClass(Observer, [{
            key: Symbol.iterator,
            value: function () {
                throw 'not implemented';
                return undefined;
            }
        }, {
            key: 'next',
            value: function next(value) {
                if (this.subscription.isDisposed) {
                    return;
                }
                var iterationResult = this.generator.next(value);
                if (typeof iterationResult !== 'undefined' && iterationResult.done) {
                    this.subscription.dispose();
                }
                return iterationResult;
            }
        }, {
            key: 'throw',
            value: function _throw(err) {
                if (this.subscription.isDisposed) {
                    return;
                }
                this.subscription.dispose();
                if (this.generator['throw']) {
                    return this.generator['throw'](err);
                }
            }
        }, {
            key: 'return',
            value: function _return(value) {
                if (this.subscription.isDisposed) {
                    return;
                }
                this.subscription.dispose();
                if (this.generator['return']) {
                    return this.generator['return'](value);
                }
            }
        }]);

        return Observer;
    })();

    module.exports = Observer;
});

//# sourceMappingURL=observer.js.map