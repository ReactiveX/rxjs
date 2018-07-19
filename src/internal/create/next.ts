import { sourceAsObservable, Observable } from "../Observable";
import { FOType, Sink } from "rxjs/internal/types";
import { Subscription } from "rxjs/internal/Subscription";
import { of } from 'rxjs/internal/create/of';

/**
 * Emits values on microtasks. Similat to {@link of} but not synchronous.
 * @param values the value to emit
 */
export function next<T>(...values: T[]): Observable<T> {
  return sourceAsObservable(
    (type: FOType.SUBSCRIBE, dest: Sink<T>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        let i = 0;
        let closed = false;
        subs.add(() => closed = true);
        let recurse: () => void;
        recurse = () => {
          if (closed) return undefined;
          if (i < values.length) {
            return Promise.resolve(values[i++])
              .then(
                value => {
                  if (!closed) {
                    dest(FOType.NEXT, value, subs);
                    return recurse();
                  }
                }
              )
          } else {
            return Promise.resolve()
              .then(() => {
                if (!closed) {
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
