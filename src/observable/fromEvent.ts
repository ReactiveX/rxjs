import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Subscription from '../Subscription';
import CompositeSubscription from '../CompositeSubscription';
import fromEventPattern from './fromEventPattern';

class EventListenerObservable extends Observable {
  element:Object;
  eventName:string;
  selector:Function;
  
  constructor(element, eventName, selector) {
    super(null);
    this.element = element;
    this.eventName = eventName;
    this.selector = selector;
  }
  
  _subscribe(observer) {
        var selector = this.selector;
        var listeners = createEventListener(
            this.element, this.eventName,
            function handler(e) {
                var result = e;
                var iteratorResult;
                
                if (selector) {
                    result = try_catch(selector).apply(this, arguments);
                    if(result === error_obj) {
                        observer["throw"](error_obj.e);
                        listeners.unsubscribe();
                        return;
                    }
                }
                iteratorResult = observer.next(result);
                if(iteratorResult.done) {
                    listeners.unsubscribe();
                }
            });
        return listeners;
    }
}

function createListener(element, name, handler) {
    if (element.addEventListener) {
        element.addEventListener(name, handler, false);
        return new Subscription(function () {
            element.removeEventListener(name, handler, false);
        });
    }
    throw new Error('No listener found.');
}

function createEventListener(element, eventName, handler) {
    var disposables = new CompositeSubscription();
    // Asume NodeList
    if (Object.prototype.toString.call(element) === '[object NodeList]') {
        for (var i = 0, len = element.length; i < len; i++) {
            disposables.add(createEventListener(element.item(i), eventName, handler));
        }
    } else if (element) {
        disposables.add(createListener(element, eventName, handler));
    }
    return disposables;
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

export default function fromEvent(element:any, eventName:string, selector:Function=null) : Observable {
    // Node.js specific
    if (element.addListener) {
        return fromEventPattern(
            function (h) {
                element.addListener(eventName, h);
            },
            function (h) {
                element.removeListener(eventName, h);
            },
            selector);
    }

    var config = this.config || {};

    // Use only if non-native events are allowed
    if (!config.useNativeEvents) {
        // Handles jq, Angular.js, Zepto, Marionette, Ember.js
        if (typeof element.on === 'function' && typeof element.off === 'function') {
            return fromEventPattern(
                function (h) {
                    element.on(eventName, h);
                },
                function (h) {
                    element.off(eventName, h);
                },
                selector);
        }
    }

    return new EventListenerObservable(element, eventName, selector);
};