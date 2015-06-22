'use strict';

exports.__esModule = true;
exports['default'] = fromEvent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _utilTryCatch = require('../util/tryCatch');

var _utilTryCatch2 = _interopRequireDefault(_utilTryCatch);

var _utilErrorObject = require('../util/errorObject');

var _utilErrorObject2 = _interopRequireDefault(_utilErrorObject);

var _Observable2 = require('../Observable');

var _Observable3 = _interopRequireDefault(_Observable2);

var _Subscription = require('../Subscription');

var _Subscription2 = _interopRequireDefault(_Subscription);

var _CompositeSubscription = require('../CompositeSubscription');

var _CompositeSubscription2 = _interopRequireDefault(_CompositeSubscription);

var _fromEventPattern = require('./fromEventPattern');

var _fromEventPattern2 = _interopRequireDefault(_fromEventPattern);

var EventListenerObservable = (function (_Observable) {
    function EventListenerObservable(element, eventName, selector) {
        _classCallCheck(this, EventListenerObservable);

        _Observable.call(this, null);
        this.element = element;
        this.eventName = eventName;
        this.selector = selector;
    }

    _inherits(EventListenerObservable, _Observable);

    EventListenerObservable.prototype.subscriber = function subscriber(observer) {
        var selector = this.selector;
        var listeners = createEventListener(this.element, this.eventName, function handler(e) {
            var result = e;
            var iteratorResult;
            if (selector) {
                result = (0, _utilTryCatch2['default'])(selector).apply(this, arguments);
                if (result === _utilErrorObject2['default']) {
                    observer['throw'](_utilErrorObject2['default'].e);
                    listeners.unsubscribe();
                    return;
                }
            }
            iteratorResult = observer.next(result);
            if (iteratorResult.done) {
                listeners.unsubscribe();
            }
        }, observer);
        return listeners;
    };

    return EventListenerObservable;
})(_Observable3['default']);

function createListener(element, name, handler, observer) {
    if (element.addEventListener) {
        element.addEventListener(name, handler, false);
        return new _Subscription2['default'](function () {
            element.removeEventListener(name, handler, false);
        }, observer);
    }
    throw new Error('No listener found.');
}
function createEventListener(element, eventName, handler, observer) {
    var subscriptions = new _CompositeSubscription2['default']();
    // Asume NodeList
    if (Object.prototype.toString.call(element) === '[object NodeList]') {
        for (var i = 0, len = element.length; i < len; i++) {
            subscriptions.add(createEventListener(element.item(i), eventName, handler, observer));
        }
    } else if (element) {
        subscriptions.add(createListener(element, eventName, handler, observer));
    }
    return subscriptions;
}
/**
 * Creates an observable sequence by adding an event listener to the matching DOMElement or each item in the NodeList.
 *
 * @example
 *   var source = Rx.Observable.fromEvent(element, 'mouseup');
 *
 * @param {any} element The DOMElement or NodeList to attach a listener.
 * @param {string} eventName The event name to attach the observable sequence.
 * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
 * @returns {Observable} An observable sequence of events from the specified element and the specified event.
 */

function fromEvent(element, eventName) {
    var selector = arguments[2] === undefined ? null : arguments[2];

    // Node.js specific
    if (element.addListener) {
        return (0, _fromEventPattern2['default'])(function (h) {
            element.addListener(eventName, h);
        }, function (h) {
            element.removeListener(eventName, h);
        }, selector);
    }
    var config = this.config || {};
    // Use only if non-native events are allowed
    if (!config.useNativeEvents) {
        // Handles jq, Angular.js, Zepto, Marionette, Ember.js
        if (typeof element.on === 'function' && typeof element.off === 'function') {
            return (0, _fromEventPattern2['default'])(function (h) {
                element.on(eventName, h);
            }, function (h) {
                element.off(eventName, h);
            }, selector);
        }
    }
    return new EventListenerObservable(element, eventName, selector);
}

;
module.exports = exports['default'];