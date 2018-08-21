import { FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export interface Subscriber<T> extends Sink<T> {
  next(value: T): void;
  error(err: any): void;
  complete(): void;
  readonly closed: boolean;
}

const CLOSED = 'closed';

const rxSubs = Symbol('rxjs subscription');

export function createSubscriber<T>(dest: Sink<T>, subs: Subscription): Subscriber<T> {
  let closed = false;
  subs.add(() => closed = true);
  const result = ((type: FOType, arg: SinkArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.NEXT:
        if (!closed) {
          dest(FOType.NEXT, arg, subs);
        }
        break;
      case FOType.ERROR:
        if (!closed) {
          closed = true;
          dest(FOType.ERROR, arg, subs);
          subs.unsubscribe();
        }
        break;
      case FOType.COMPLETE:
        if (!closed) {
          closed = true;
          dest(FOType.COMPLETE, undefined, subs);
          subs.unsubscribe();
        }
        break;
      default:
    }
  }) as Subscriber<T>;

  result.next = next;
  result.error = error;
  result.complete = complete;
  result[rxSubs] = subs;
  Object.defineProperty(result, CLOSED, {
    get() { return closed; },
  });
  return result;
}

function next<T>(this: Subscriber<T>, value: T) {
  this(FOType.NEXT, value, this[rxSubs]);
}

function error<T>(this: Subscriber<T>, err: any) {
  this(FOType.ERROR, err, this[rxSubs]);
}

function complete<T>(this: Subscriber<T>) {
  this(FOType.COMPLETE, undefined, this[rxSubs]);
}
