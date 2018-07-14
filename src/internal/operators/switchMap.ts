import { ObservableInput, Operation, FOType, Sink, SinkArg, Source } from '../types';
import { Observable, sourceAsObservable } from '../Observable';
import { Subscription } from '../Subscription';
import { fromSource } from '../create/from';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { operator } from '../util/operator';

export function switchMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Number.POSITIVE_INFINITY,
): Operation<T, R> {
  return operator((source: Observable<T>, type: FOType, dest: Sink<R>, subs: Subscription) => {
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
