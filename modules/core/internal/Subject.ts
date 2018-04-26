import { Observer, FOType, FObsArg, FObs } from './types';
import { Observable, sourceAsObservable } from './Observable';
import { Subscription } from './Subscription';

export interface Subject<T> extends Observer<T>, Observable<T> {
}

export interface SubjectConstructor {
  new<T>(): Subject<T>;
}

export const Subject: SubjectConstructor = (<T>() => {
  let state: any[];
  let source = subjectSource<T>();
  return sourceAsSubject<T>(source);
}) as any;

export function subjectSource<T>(): FObs<T> {
  let state: any[];
  let hasError = false;
  let error: any;
  return ((type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.SUBSCRIBE:
        if (hasError) {
          arg(FOType.ERROR, error, subs);
          return;
        }
        state = (state || []);
        state.push(arg, subs);
        subs.add(() => {
          const i = state.indexOf(arg);
          state.splice(i, 2);
        });
        break;
      case FOType.NEXT:
        if (state) {
          for (let i = 0; i < state.length; i += 2) {
            state[i](type, arg, state[i + 1]);
          }
        }
        break;
      case FOType.ERROR:
        hasError = true;
        error = arg;
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
  });
}

export function sourceAsSubject<T>(source: any): Subject<T> {
  source = sourceAsObservable(source) as Subject<T>;
  source.next = next;
  source.error = error;
  source.complete = complete;
  return source;
}

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
