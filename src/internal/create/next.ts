import { sourceAsObservable, Observable } from "../Observable";
import { FOType, Sink } from "rxjs/internal/types";
import { Subscription } from "rxjs/internal/Subscription";
import { of } from 'rxjs/internal/create/of';

/**
 * Emits values on microtasks. Similar to {@link of} but not synchronous.
 * @param values the value to emit
 */
export function next<T>(...values: T[]): Observable<T> {
  return sourceAsObservable(
    (type: FOType.SUBSCRIBE, dest: Sink<T>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        let i = 0;
        let recurse: () => void;
        recurse = () => {
          if (subs.closed) return undefined;
          if (i < values.length) {
            return Promise.resolve(values[i++])
              .then(
                value => {
                  if (!subs.closed) {
                    dest(FOType.NEXT, value, subs);
                    return recurse();
                  }
                }
              )
          } else {
            return Promise.resolve()
              .then(() => {
                if (!subs.closed) {
                  dest(FOType.COMPLETE, undefined, subs);
                }
              });
          }
        };
        recurse();
      }
    }
  );
}
