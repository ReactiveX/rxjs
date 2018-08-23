import { ObservableInput, Operation, FOType, Sink, SinkArg, Source } from '../types';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { fromSource } from "../sources/fromSource";
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { lift } from '../util/lift';

export function mergeMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Number.POSITIVE_INFINITY,
): Operation<T, R> {
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    let counter = 0;
    let active = 0;
    let outerComplete = false;
    const buffer: Array<{outerValue: T, outerIndex: number}> = [];

    let startNextInner: () => void;
    startNextInner = () => {
      while (buffer.length > 0 && active < concurrent) {
        active++;
        const { outerValue, outerIndex } = buffer.shift();

        const innerSource = tryUserFunction(() => fromSource(project(outerValue, outerIndex)));
        if (resultIsError(innerSource)) {
          dest(FOType.ERROR, innerSource.error, subs);
          subs.unsubscribe();
          return;
        }

        const innerSubs = new Subscription();
        subs.add(innerSubs);

        innerSource(FOType.SUBSCRIBE, (type: FOType, v: SinkArg<R>, innerSubs: Subscription) => {
          switch (type) {
            case FOType.NEXT:
              dest(FOType.NEXT, v, subs);
              break;
            case FOType.ERROR:
              dest(FOType.ERROR, v, subs);
              subs.unsubscribe();
              break;
            case FOType.COMPLETE:
              active--;
              innerSubs.unsubscribe();
              if (buffer.length > 0) {
                startNextInner();
              } else if (outerComplete && active === 0) {
                dest(FOType.COMPLETE, undefined, subs);
              }

            default:
          }
        }, innerSubs);
      }
    }

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>) => {
      switch (t) {
        case FOType.SUBSCRIBE:
          subs = v;
          break;
        case FOType.NEXT:
          let outerIndex = counter++;
          buffer.push({ outerValue: v, outerIndex });
          startNextInner();
          break;
        case FOType.ERROR:
          dest(FOType.ERROR, v, subs);
          subs.unsubscribe();
          break;
        case FOType.COMPLETE:
          outerComplete = true;
          if (buffer.length > 0) {
            startNextInner();
          } else if (active === 0) {
            dest(FOType.COMPLETE, undefined, subs);
            subs.unsubscribe();
          }
          break;
        default:
      }
    }, subs);
  });
}
