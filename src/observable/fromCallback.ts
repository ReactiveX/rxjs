import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';
import {immediate} from '../scheduler/immediate';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export class CallbackObservable<T> extends Observable<T> {

  _isScalar: boolean = false;
  value: T | T[];

  static create<T>(callbackFunc: Function,
                   ctx: Object = undefined,
                   selector: Function = undefined,
                   scheduler: Scheduler = immediate): Function {
    return (...args): Observable<T> => {
      return new CallbackObservable(callbackFunc, ctx, selector, args, scheduler);
    };
  }

  constructor(private callbackFunc: Function,
              private ctx,
              private selector,
              private args: any[],
              public scheduler: Scheduler = immediate) {
    super();
  }

  _subscribe(subscriber: Subscriber<T | T[]>) {
    const callbackFunc = this.callbackFunc;
    const ctx = this.ctx;
    const selector = this.selector;
    const args = this.args;
    const scheduler = this.scheduler;

    let handler;

    if (scheduler === immediate) {
      if (this._isScalar) {
        subscriber.next(this.value);
        subscriber.complete();
      } else {
        handler = (...innerArgs) => {
          let results;

          this._isScalar = true;
          this.value = innerArgs;

          if (selector) {
            results = tryCatch(selector).apply(ctx, innerArgs);
            if (results === errorObject) { return subscriber.error(results.e); }
            subscriber.next(results);
          } else {
            if (innerArgs.length <= 1) {
              subscriber.next(innerArgs[0]);
            } else {
              subscriber.next(innerArgs);
            }
          }
          subscriber.complete();
        };
      }
    } else {
      const subscription = new Subscription();
      if (this._isScalar) {
        const value = this.value;
        subscription.add(scheduler.schedule(dispatchNext, 0, { value, subscriber }));
      } else {
        handler = (...innerArgs) => {
          let results;

          this._isScalar = true;

          if (selector) {
            results = tryCatch(selector).apply(ctx, innerArgs);
            if (results === errorObject) {
              return subscription.add(scheduler.schedule(dispatchError, 0, { err: results.e, subscriber }));
            }
            this.value = results;
          } else {
            if (innerArgs.length <= 1) {
              this.value = innerArgs[0];
            } else {
              this.value = innerArgs;
            }
          }
          const value = this.value;
          subscription.add(scheduler.schedule(dispatchNext, 0, { value, subscriber }));
        };
        return subscription;
      }
    }

    if (handler) {
      args.push(handler);
      callbackFunc.apply(ctx, args);
    }
  }
}

function dispatchNext({ value, subscriber }) {
  subscriber.next(value);
  subscriber.complete();
}

function dispatchError({ err, subscriber }) {
  subscriber.error(err);
}
