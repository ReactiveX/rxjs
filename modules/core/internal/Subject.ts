import { Observer, FOType, FObsArg } from './types';
import { Observable, sourceAsObservable } from './Observable';
import { Subscription } from './Subscription';

export interface Subject<T> extends Observer<T>, Observable<T> {
}

export interface SubjectConstructor {
  new<T>(): Subject<T>;
}

export const Subject: SubjectConstructor = (<T>() => {
  let state: any[];
  let result = ((type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.SUBSCRIBE:
        state = (state || []);
        state.push(arg, subs);
        break;
      case FOType.NEXT:
        if (state) {
          for (let i = 0; i < state.length; i += 2) {
            state[i](type, arg, state[i + 1]);
          }
        }
        break;
      case FOType.ERROR:
      case FOType.COMPLETE:
        if (state) {
          while (state.length > 0) {
            const sink = state.shift();
            const childSubs = state.shift();
            sink(type, arg, childSubs);
          }
        }
        break;
      default:
        break;
    }
  }) as Subject<T>;

  result = sourceAsObservable(result) as Subject<T>;
  result.next = next;
  result.error = error;
  result.complete = complete;
  return result;
}) as any;

function next<T>(this: Subject<T>, value: T, subs: Subscription) {
  this(FOType.NEXT, value, subs);
}

// NOTE: For error and complete, subscription doesn't matter, as
// we are passing it from state

function error<T>(this: Subject<T>, err: any) {
  this(FOType.ERROR, err, undefined);
}

function complete<T>(this: Subject<T>) {
  this(FOType.COMPLETE, undefined, undefined);
}
