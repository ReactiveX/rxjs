import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { FOType, Sink } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export function throwError(err: any): Observable<never> {
  return sourceAsObservable((type: FOType.SUBSCRIBE, sink: Sink<never>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) sink(FOType.ERROR, err, subs);
  });
}
