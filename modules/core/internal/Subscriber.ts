import { FOType, Sink, SinkArg, PartialObserver } from './types';
import { Subscription } from './Subscription';

export interface Subscriber<T> extends Sink<T> {
  next(value: T): void;
  error(err: any): void;
  complete(): void;
  readonly closed: boolean;
}

const CLOSED = 'closed';

export function createSubscriber<T>(dest: Sink<T>): Subscriber<T> {
  let subs: Subscription;
  let closed = false;
  const result = ((type: FOType, arg: SinkArg<T>) => {
    switch (type) {
      case FOType.SUBSCRIBE:
        subs = arg;
        subs.add(() => {
          closed = true
        });
        dest(FOType.SUBSCRIBE, subs);
        break;
      case FOType.NEXT:
        if (!closed) {
          dest(FOType.NEXT, arg);
        }
        break;
      case FOType.ERROR:
        if (!closed) {
          closed = true;
          dest(FOType.ERROR, arg);
          subs.unsubscribe();
        }
        break;
      case FOType.COMPLETE:
        if (!closed) {
          closed = true;
          dest(FOType.COMPLETE, undefined);
          subs.unsubscribe();
        }
        break;
      default:
    }
  }) as Subscriber<T>;

  result.next = next;
  result.error = error;
  result.complete = complete;
  Object.defineProperty(result, CLOSED, {
    get() { return closed; },
  });
  return result;
}

function next<T>(this: Subscriber<T>, value: T) {
  this(FOType.NEXT, value);
}

function error<T>(this: Subscriber<T>, err: any) {
  this(FOType.ERROR, err);
}

function complete<T>(this: Subscriber<T>) {
  this(FOType.COMPLETE, undefined);
}
