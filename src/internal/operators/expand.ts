import { ObservableInput, Sink, Operation, FOType, SinkArg } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Observable } from '../Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { fromSource } from 'rxjs/internal/create/from';

export function expand<T, R>(project: (value: T|R, index: number) => ObservableInput<R>, concurrent = Number.POSITIVE_INFINITY): Operation<T, R> {
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    let i = 0;
    let active = 0;
    let outerCompleted = false;
    const buffer: T[] = [];

    const nextHandler = (v: any) => {
      if (active++ < concurrent) {
        const index = i++;
        dest(FOType.NEXT, v, subs);
        const innerSource = tryUserFunction(() => fromSource(project(v, index)));
        if (resultIsError(innerSource)) {
          dest(FOType.ERROR, innerSource.error, subs);
          subs.unsubscribe();
          return;
        }
        const innerSubs = new Subscription();
        subs.add(innerSubs);
        innerSource(FOType.SUBSCRIBE, (ti: FOType, vi: SinkArg<R>, subs: Subscription) => {
          switch (ti) {
            case FOType.NEXT:
              nextHandler(vi);
              break;
            case FOType.ERROR:
              dest(ti, vi, subs);
              break;
            case FOType.COMPLETE:
              active--;
              if (buffer.length > 0) {
                nextHandler(buffer.shift());
              } else if (active === 0 && outerCompleted) {
                dest(FOType.COMPLETE, undefined, subs);
                subs.unsubscribe();
              }
              break;
            default:
              break;
          }
        }, innerSubs);
      } else {
        buffer.push(v);
      }
    }

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (v === FOType.NEXT) {
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
