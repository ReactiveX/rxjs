import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {Scheduler} from '../Scheduler';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';
import {AsyncSubject} from '../subject/AsyncSubject';

export class BoundNodeCallbackObservable<T> extends Observable<T> {
  subject: AsyncSubject<T>;

  static create<T>(callbackFunc: Function,
                   selector: Function = undefined,
                   scheduler?: Scheduler): Function {
    return (...args: any[]): Observable<T> => {
      return new BoundNodeCallbackObservable(callbackFunc, selector, args, scheduler);
    };
  }

  constructor(private callbackFunc: Function,
              private selector: Function,
              private args: any[],
              public scheduler: Scheduler) {
    super();
  }

  _subscribe(subscriber: Subscriber<T | T[]>): Subscription {
    const callbackFunc = this.callbackFunc;
    const args = this.args;
    const scheduler = this.scheduler;
    let subject = this.subject;

    if (!scheduler) {
      if (!subject) {
        subject = this.subject = new AsyncSubject<T>();
        const handler = function handlerFn(...innerArgs: any[]) {
          const source = (<any>handlerFn).source;
          const { selector, subject } = source;
          const err = innerArgs.shift();

          if (err) {
            subject.error(err);
          } else if (selector) {
            const result = tryCatch(selector).apply(this, innerArgs);
            if (result === errorObject) {
              subject.error(errorObject.e);
            } else {
              subject.next(result);
              subject.complete();
            }
          } else {
            subject.next(innerArgs.length === 1 ? innerArgs[0] : innerArgs);
            subject.complete();
          }
        };
        // use named function instance to avoid closure.
        (<any>handler).source = this;

        const result = tryCatch(callbackFunc).apply(this, args.concat(handler));
        if (result === errorObject) {
          subject.error(errorObject.e);
        }
      }
      return subject.subscribe(subscriber);
    } else {
      return scheduler.schedule(dispatch, 0, { source: this, subscriber });
    }
  }
}

function dispatch<T>(state: { source: BoundNodeCallbackObservable<T>, subscriber: Subscriber<T> }) {
  const self = (<Subscription> this);
  const { source, subscriber } = state;
  const { callbackFunc, args, scheduler } = source;
  let subject = source.subject;

  if (!subject) {
    subject = source.subject = new AsyncSubject<T>();

    const handler = function handlerFn(...innerArgs: any[]) {
      const source = (<any>handlerFn).source;
      const { selector, subject } = source;
      const err = innerArgs.shift();

      if (err) {
        subject.error(err);
      } else if (selector) {
        const result = tryCatch(selector).apply(this, innerArgs);
        if (result === errorObject) {
          self.add(scheduler.schedule(dispatchError, 0, { err: errorObject.e, subject }));
        } else {
          self.add(scheduler.schedule(dispatchNext, 0, { value: result, subject }));
        }
      } else {
        const value = innerArgs.length === 1 ? innerArgs[0] : innerArgs;
        self.add(scheduler.schedule(dispatchNext, 0, { value, subject }));
      }
    };
    // use named function to pass values in without closure
    (<any>handler).source = source;

    const result = tryCatch(callbackFunc).apply(this, args.concat(handler));
    if (result === errorObject) {
      subject.error(errorObject.e);
    }
  }

  self.add(subject.subscribe(subscriber));
}

function dispatchNext({ value, subject }) {
  subject.next(value);
  subject.complete();
}

function dispatchError({ err, subject }) {
  subject.error(err);
}
