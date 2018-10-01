import { ObservableInput, FOType, Sink, Source, SinkArg } from '../types';
import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { Subscription } from '../Subscription';
import { fromSource } from "../sources/fromSource";
import { tryUserFunction, resultIsError } from '../util/userFunction';


/**
 * Returns an Observable that mirrors the first source Observable to emit an item.
 *
 * ## Example
 * ### Subscribes to the observable that was the first to start emitting.
 *
 * ```javascript
 * const obs1 = interval(1000).pipe(mapTo('fast one'));
 * const obs2 = interval(3000).pipe(mapTo('medium one'));
 * const obs3 = interval(5000).pipe(mapTo('slow one'));
 *
 * race(obs3, obs1, obs2)
 * .subscribe(
 *   winner => console.log(winner)
 * );
 *
 * // result:
 * // a series of 'fast one'
 * ```
 *
 * @param {...ObservableInput<T>[]} sources ...observables sources used to race for which Observable emits first.
 * @return {ObservableInput[]} an Observable that mirrors the output of the first Observable to emit an item.
 * @static true
 * @name race
 * @owner Observable
 */
export function race<T>(sources: Array<ObservableInput<T>>): Observable<T>;
export function race<T>(...sources: ObservableInput<T>[]): Observable<T>;
export function race<T>(...sources: ObservableInput<T>[]): Observable<T> {
  if (sources.length === 1 && Array.isArray(sources[0])) {
    sources = sources[0] as any;
  }
  return sourceAsObservable(raceSource(sources));
}

export function raceSource<T>(sources: ObservableInput<T>[]): Source<T> {
  return (type: FOType, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      let allSubs: Subscription[] = [];
      for (let s = 0; s < sources.length; s++) {
        const source = sources[s];
        const src = tryUserFunction(fromSource, source);
        if (resultIsError(src)) {
          sink(FOType.ERROR, src.error, subs);
          return;
        }

        const mySubs = new Subscription();
        subs.add(mySubs);
        allSubs.push(mySubs);
        src(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, mySubs: Subscription) => {
          if (allSubs && t === FOType.NEXT) {
            for (let childSubs of allSubs) {
              if (childSubs !== mySubs) childSubs.unsubscribe();
            }
            allSubs = null;
          }
          sink(t, v, subs);
        }, mySubs);
      }
    }
  };
}
