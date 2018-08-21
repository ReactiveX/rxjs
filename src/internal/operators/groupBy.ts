import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { Operation, FOType, Sink, SinkArg, GroupedObservable, ObservableInput } from '../types';
import { Subscription } from '../Subscription';
import { subjectSource } from '../Subject';
import { fromSource } from '../create/from';
import { tryUserFunction, resultIsError } from '../util/userFunction';
import { lift } from '../util/lift';

/**
 * NOTES:
 * - config is new.
 * - elementSelector will need to be deprecated in v6
 * - subjectSelector will need to be deprecated in v6
 */

export interface GroupByConfig<T, K, R> {
  keySelector: (value: T, index: number) => K;
  durationSelector?: (grouped: GroupedObservable<K, R>) => ObservableInput<any>,
}

/* tslint:disable:max-line-length */
export function groupBy<T, K>(keySelector: (value: T, index: number) => K): Operation<T, GroupedObservable<K, T>>;
export function groupBy<T, K, R>(config: GroupByConfig<T, K, R>): Operation<T, GroupedObservable<K, T>>;
/* tslint:enable:max-line-length */

export function groupBy<T, K, R>(
  keySelectorOrConfig: ((value: T, index: number) => K) | GroupByConfig<T, K, R>,
): Operation<T, T> {

  const config = (typeof keySelectorOrConfig === 'function')
    ? { keySelector: keySelectorOrConfig }
    : keySelectorOrConfig;

  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    const { keySelector, durationSelector } = config;
    const lookup = new Map<K, GroupedObservable<K, R>>();
    let index = 0;

    const allSink = (t: FOType, v: SinkArg<R>, subs: Subscription) => {
      const groups = lookup.values();
      while (true) {
        const { done, value } = groups.next();
        if (done) break;
        value(t, v, subs);
      }
      dest(t, v, subs);
    };

    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        const key = tryUserFunction(keySelector, v, index++);
        if (resultIsError(key)) {
          allSink(FOType.ERROR, key.error, subs);
          subs.unsubscribe();
          return;
        }
        let group: GroupedObservable<K, R>;
        if (lookup.has(key)) {
          group = lookup.get(key);
        } else {
          group = groupedObservable(key);
          lookup.set(key, group);

          if (durationSelector) {
            const notifier = tryUserFunction(() => fromSource(durationSelector(group)));
            if (resultIsError(notifier)) {
              allSink(FOType.ERROR, notifier.error, subs);
              subs.unsubscribe();
              return;
            }
            notifier(FOType.SUBSCRIBE, (nt: FOType, nv: SinkArg<any>, subs: Subscription) => {
              if (nt === FOType.NEXT) {
                group(FOType.COMPLETE, undefined, subs);
                lookup.delete(key);
              }
            }, subs);
          }

          dest(FOType.NEXT, group, subs);
        }
        group(FOType.NEXT, v, subs);
      } else {
        allSink(t, v, subs);
      }
    }, subs);
  });
}


function groupedObservable<K, R>(key: K): GroupedObservable<K, R> {
  let result = sourceAsObservable(subjectSource<R>()) as GroupedObservable<K, R>;
  Object.defineProperty(result, 'key', {
    get() { return key; }
  });
  return result;
}
