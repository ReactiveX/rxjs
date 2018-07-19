import { ObservableInput, Operation, FOType, Sink, SinkArg, Source } from "rxjs/internal/types";
import { Observable, sourceAsObservable } from "../Observable";
import { Subscription } from "rxjs/internal/Subscription";
import { fromSource } from "rxjs/internal/create/from";
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { lift } from 'rxjs/internal/util/lift';

export function catchError<T, R>(handler: (err: any) => ObservableInput<R>): Operation<T, T|R> {
  return lift((source: Observable<T>, dest: Sink<T|R>, downstreamSubs: Subscription) => {
      const upstreamSubs = new Subscription();
      downstreamSubs.add(upstreamSubs);
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, upstreamSubs: Subscription) => {
        if (t === FOType.ERROR) {
          upstreamSubs.unsubscribe();
          const result = tryUserFunction(() => fromSource(handler(v)));
          if (resultIsError(result)) {
            dest(FOType.ERROR, result.error, downstreamSubs);
            return;
          }
          result(FOType.SUBSCRIBE, dest, downstreamSubs);
        } else {
          dest(t, v, downstreamSubs);
        }
      }, upstreamSubs);
  });
}
