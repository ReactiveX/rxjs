import { ObservableInput } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';
import { fromSource } from 'rxjs/internal/sources/fromSource';

export function from<T>(input: ObservableInput<T>): Observable<T> {
  return sourceAsObservable(fromSource(input));
}


