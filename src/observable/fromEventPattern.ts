import try_catch from '../util/tryCatch';
import error_obj from '../util/errorObject';
import Observable from '../Observable';
import Observer from '../Observer';

class FromEventPatternObservable extends Observable {
	add:Function;
	remove:Function;
	selector:Function;
	
	constructor(add:Function, remove:Function, selector:Function) {
		super(null);
    this.add = add;
    this.remove = remove;
    this.selector = selector;
	}
	
	 _subscribe(subscriber:Observer) : Function {
				var unsubscribe = () => {
            if (remove) {
                remove(innerHandler, token);
            }
        }
				
        function innerHandler(e) {
            var result = e;
            if (selector) {
                result = try_catch(selector).apply(this, arguments);
                if(result === error_obj) {
                    subscriber["throw"](error_obj.e);
                    unsubscribe();
                    return;
                }
            }
            result = subscriber.next(result);
            if(result.done) {
                unsubscribe();
            }
        }

        var self = this;
        var remove = this.remove;
        var selector = this.selector;
        var token = this.add(innerHandler);

        return unsubscribe;
    }
}

/**
 * Creates an observable sequence from an event emitter via an addHandler/removeHandler pair.
 * @param {Function} addHandler The function to add a handler to the emitter.
 * @param {Function} [removeHandler] The optional function to remove a handler from an emitter.
 * @param {Function} [selector] A selector which takes the arguments from the event handler to produce a single item to yield on next.
 * @returns {Observable} An observable sequence which wraps an event from an event emitter
 */
export default function fromEventPattern(addHandler:Function, removeHandler:Function=null, selector:Function=null) : Observable {
    return new FromEventPatternObservable(addHandler, removeHandler, selector);
};