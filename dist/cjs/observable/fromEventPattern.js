'use strict';

exports.__esModule = true;
exports['default'] = fromEventPattern;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var FromEventPatternObservable = (function (_Observable) {
    function FromEventPatternObservable(add, remove, selector) {
        _classCallCheck(this, FromEventPatternObservable);

        _Observable.call(this, null);
        this.add = add;
        this.remove = remove;
        this.selector = selector;
    }

    _inherits(FromEventPatternObservable, _Observable);

    FromEventPatternObservable.prototype.subscriber = function subscriber(_subscriber) {
        var unsubscribe = function unsubscribe() {
            if (remove) {
                remove(innerHandler, token);
            }
        };
        function innerHandler(e) {
            var result = e;
            if (selector) {
                result = (0, _utilTryCatch2['default'])(selector).apply(this, arguments);
                if (result === _utilErrorObject2['default']) {
                    _subscriber['throw'](_utilErrorObject2['default'].e);
                    unsubscribe();
                    return;
                }
            }
            result = _subscriber.next(result);
            if (result.done) {
                unsubscribe();
            }
        }
        var self = this;
        var remove = this.remove;
        var selector = this.selector;
        var token = this.add(innerHandler);
        return unsubscribe;
    };

    return FromEventPatternObservable;
})(_Observable3['default']);

/**
 * Creates an observable sequence from an event emitter via an addHandler/removeHandler pair.
 * @param {Function} addHandler The function to add a handler to the emitter.
 * @param {Function} [removeHandler] The optional function to remove a handler from an emitter.
 * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
 * @returns {Observable} An observable sequence which wraps an event from an event emitter
 */

function fromEventPattern(addHandler) {
    var removeHandler = arguments[1] === undefined ? null : arguments[1];
    var selector = arguments[2] === undefined ? null : arguments[2];

    return new FromEventPatternObservable(addHandler, removeHandler, selector);
}

;
module.exports = exports['default'];