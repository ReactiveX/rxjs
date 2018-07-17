import { FOType, FObsArg, FObs } from "../types";
import { Subscription } from "../Subscription";
import { sourceAsObservable } from "../Observable";
import { Subject } from "../Subject";

export function subjectBaseSource<T>(): FObs<T> {
  let state: any[];

  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.SUBSCRIBE:
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
  };
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
