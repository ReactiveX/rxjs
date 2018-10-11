import { lift } from 'rxjs/internal/util/lift';
import { Observable } from 'rxjs/internal/Observable';
import { FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';

export function skipWhile<T>(predicate: (value: T, index: number) => boolean) {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    let skipping = true;
    let i = 0;
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (skipping && t === FOType.NEXT) {
        const match = tryUserFunction(predicate, v, i++);
        if (resultIsError(match)) {
          dest(FOType.ERROR, match.error, subs);
          return;
        }

        skipping = match;
      }
      if (t !== FOType.NEXT || !skipping) {
        dest(t, v, subs);
      }
    }, subs);
  });
}
