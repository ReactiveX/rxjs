import { operator } from '../util/operator';
import { Observable } from '../Observable';
import { FOType, ObservableInput, Operation, Sink, SinkArg } from '../types';
import { Subscription } from '../Subscription';
import { tryUserFunction, resultIsError } from '../util/userFunction';

function DEFAULT_COMPARER<T>(a: T, b: T) {
  return a === b;
}

export function distinctUntilChanged<T, K>(comparer: (a:T, b:T) => boolean = DEFAULT_COMPARER, keySelector?: (value: T) => K) {
  return operator((source: Observable<T>, type: FOType, dest: Sink<T>, subs: Subscription)  => {
    let key: K;
    let hasKey = false;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      let k: any;

      if (t === FOType.NEXT) {
        k = v;
        if (keySelector) {
          k = tryUserFunction(keySelector, v);
          if (resultIsError(k)) {
            dest(FOType.ERROR, k.error, subs);
            subs.unsubscribe();
            return;
          }
        }

        if (hasKey) {
          const match = tryUserFunction(comparer, key, k);
          if (resultIsError(match)) {
            dest(FOType.ERROR, match.error, subs);
            subs.unsubscribe();
            return;
          }

          if (match) {
            return;
          }
        }

        hasKey = true;
      }

      dest(t, v, subs);
    }, subs);
  });
}
