import { ObservableInput, FOType, Sink, Source } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { Subscription } from 'rxjs/internal/Subscription';
import { fromSource } from 'rxjs/internal/sources/fromSource';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';

export function defer<T>(fn: () => ObservableInput<T>): Observable<T> {
  return sourceAsObservable(deferSource(fn));
}

export function deferSource<T>(fn: () => ObservableInput<T>): Source<T> {
  return (type: FOType, sink: Sink<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      const result = tryUserFunction(() => fromSource(fn()));
      if (resultIsError(result)) {
        sink(FOType.ERROR, result.error, subs);
        return;
      }
      result(FOType.SUBSCRIBE, sink, subs);
    }
  };
}
