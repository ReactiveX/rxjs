import Observable from '../Observable';
import Subscription from '../Subscription';
import tryCatch from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export default class FromEventPatternObservable<T, R> extends Observable<T> {

  static create<T>(addHandler: (handler: Function) => any,
                   removeHandler: (handler: Function) => void,
                   selector?: (...args: Array<any>) => T) {
    return new FromEventPatternObservable(addHandler, removeHandler, selector);
  }

  constructor(private addHandler: (handler: Function) => any,
              private removeHandler: (handler: Function) => void,
              private selector?: (...args: Array<any>) => T) {
    super();
  }

  _subscribe(subscriber) {
    const addHandler = this.addHandler;
    const removeHandler = this.removeHandler;
    const selector = this.selector;

    const handler = selector ? function(e) {
      let result = tryCatch(selector).apply(null, arguments);
      if (result === errorObject) {
        subscriber.error(result.e);
      } else {
        subscriber.next(result);
      }
    } : function(e) { subscriber.next(e); };

    let result = tryCatch(addHandler)(handler);
    if (result === errorObject) {
      subscriber.error(result.e);
    }
    subscriber.add(new Subscription(() => {
      //TODO: determine whether or not to forward to error handler
      removeHandler(handler);
    }));
  }
}
