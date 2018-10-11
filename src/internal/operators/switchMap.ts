import { ObservableInput, Operation, FOType, Sink, SinkArg, Source } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { fromSource } from "rxjs/internal/sources/fromSource";
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { lift } from 'rxjs/internal/util/lift';

export function switchMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Number.POSITIVE_INFINITY,
): Operation<T, R> {
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    let index = 0;
    let outerComplete = false;
    let innerSubs: Subscription;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      switch (t) {
        case FOType.NEXT:
          if (innerSubs) {
            innerSubs.unsubscribe();
          }
          const result = tryUserFunction(() => fromSource(project(v, index++)));
          if (resultIsError(result)) {
            dest(FOType.ERROR, result.error, subs);
            subs.unsubscribe();
            return;
          }

          innerSubs = new Subscription();
          innerSubs.add(() => {
            subs.remove(innerSubs);
            innerSubs = undefined;
          });
          subs.add(innerSubs);
          result(FOType.SUBSCRIBE, (ti: FOType, vi: SinkArg<R>, innerSubs: Subscription) => {
            if (ti === FOType.COMPLETE) {
              innerSubs.unsubscribe();
              if (outerComplete) {
                dest(FOType.COMPLETE, undefined, subs);
                subs.unsubscribe();
              }
            } else {
              dest(ti, vi, subs);
              if (ti === FOType.ERROR) {
                subs.unsubscribe();
              }
            }
          }, innerSubs);
          break;
        case FOType.COMPLETE:
          outerComplete = true;
          if (innerSubs) break;
        case FOType.ERROR:
          dest(t, v, subs);
          subs.unsubscribe();
          break;
        default:
          break;
      }
    }, subs);
  });
}
