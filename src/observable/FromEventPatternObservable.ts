import {Observable} from '../Observable';
import {Subscription} from '../Subscription';
import {Subscriber} from '../Subscriber';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class FromEventPatternObservable<T, R> extends Observable<T> {

  /**
   * @param addHandler
   * @param removeHandler
   * @param selector
   * @return {FromEventPatternObservable}
   * @static true
   * @name fromEventPattern
   * @owner Observable
   */
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

  protected _subscribe(subscriber: Subscriber<T>) {
    const removeHandler = this.removeHandler;

    const handler = !!this.selector ? (...args: Array<any>) => {
      this._callSelector(subscriber, args);
    } : function(e: any) { subscriber.next(e); };

    this._callAddHandler(handler, subscriber);
    subscriber.add(new Subscription(() => {
      //TODO: determine whether or not to forward to error handler
      removeHandler(handler);
    }));
  }

  private _callSelector(subscriber: Subscriber<T>, args: Array<any>): void {
    try {
      const result: T = this.selector(...args);
      subscriber.next(result);
    }
    catch (e) {
      subscriber.error(e);
    }
  }

  private _callAddHandler(handler: (e: any) => void, errorSubscriber: Subscriber<T>): void {
    try {
      this.addHandler(handler);
    }
    catch (e) {
      errorSubscriber.error(e);
    }
  }
}