import {Subscriber} from './Subscriber';
import {tryOrOnError} from './util/tryOrOnError';
import {noop} from './util/noop';
import {throwError} from './util/throwError';

export class AutoDetachSubscriber<T> extends Subscriber<T> {
  static create<T>(next?: (x?: T) => void,
                   error?: (e?: any) => void,
                   complete?: () => void): Subscriber<T> {
    const subscriber = new AutoDetachSubscriber<T>();
    subscriber._next = (typeof next === 'function') && tryOrOnError(next) || noop;
    subscriber._error = (typeof error === 'function') && error || throwError;
    subscriber._complete = (typeof complete === 'function') && complete || noop;
    return subscriber;
  }

  error(err: any) {
    super.error(err);
    super.unsubscribe();
  }

  complete() {
    super.complete();
    super.unsubscribe();
  }
}