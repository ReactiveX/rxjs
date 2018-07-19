import { ObservableInput, Operation, FOType, Sink, SinkArg, Source } from 'rxjs/internal/types';
import { Observable, sourceAsObservable } from '../Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { fromSource } from 'rxjs/internal/create/from';
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
              }
            } else {
              dest(ti, vi, subs);
            }
          }, innerSubs);
          break;
        case FOType.COMPLETE:
          outerComplete = true;
          if (innerSubs) break;
        case FOType.ERROR:
          dest(t, v, subs);
          break;
        default:
          break;
      }
    }, subs);
  });
}
