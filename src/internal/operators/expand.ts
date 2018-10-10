import { ObservableInput, Sink, Operation, FOType, SinkArg } from '../types';
import { lift } from '../util/lift';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { fromSource } from "../sources/fromSource";


export function expand<T>(project: (value: T, index: number) => ObservableInput<T>, concurrent?: number): Operation<T, T>;

export function expand<T, R>(project: (value: T|R, index: number) => ObservableInput<R>, concurrent = Number.POSITIVE_INFINITY): Operation<T, R> {
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    let i = 0;
    let active = 0;
    let outerCompleted = false;
    const buffer: T[] = [];

    const nextHandler = (v: T) => {
      const index = i++;
      if (active < concurrent) {
        dest(FOType.NEXT, v, subs);
        const result = tryUserFunction(() => fromSource(project(v, index)));
        if (resultIsError(result)) {
          dest(FOType.ERROR, result.error, subs);
        } else {
          const innerSubs = new Subscription();
          subs.add(innerSubs);
          active++;
          result(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, innerSubs: Subscription) => {
            switch(t) {
              case FOType.NEXT:
                nextHandler(v);
                break;
              case FOType.ERROR:
                dest(t, v, subs);
                break;
              case FOType.COMPLETE:
                active--;
                if (buffer.length > 0) {
                  nextHandler(buffer.shift());
                }
                if (outerCompleted && active === 0) {
                  dest(FOType.COMPLETE, undefined, subs);
                }
                break;
              default:
                break;
            }
          }, innerSubs);
        }
      } else {
        buffer.push(v);
      }
    }

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        nextHandler(v);
      } else if (t === FOType.COMPLETE) {
        outerCompleted = true;
        if (active === 0) {
          dest(FOType.COMPLETE, undefined, subs);
        }
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
