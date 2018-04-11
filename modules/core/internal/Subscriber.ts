import { FOType, Sink, SinkArg, PartialObserver, Subs } from './types';
import { Subscription, concatSubs } from './Subscription';

export interface Subscriber<T> extends Sink<T> {
  next(value: T): void;
  error(err: any): void;
  complete(): void;
  readonly closed: boolean;
}

const CLOSED = 'closed';

export function createSubscriber<T>(dest: Sink<T>): Subscriber<T> {
  let subs: Subs;
  let closed = false;
  const result = ((type: FOType, arg: SinkArg<T>) => {
    switch (type) {
      case FOType.SUBSCRIBE:
        subs = concatSubs(arg, () => {
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
          subs(FOType.COMPLETE, undefined);
        }
        break;
      case FOType.COMPLETE:
        if (!closed) {
          closed = true;
          dest(FOType.COMPLETE, undefined);
          subs(FOType.COMPLETE, undefined);
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
