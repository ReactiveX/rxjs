import { ObservableInput } from '../types';
import { Observable } from '../Observable';
import { sourceAsObservable } from '../util/sourceAsObservable';
import { fromSource } from '../sources/fromSource';

export function from<T>(input: ObservableInput<T>): Observable<T> {
  return sourceAsObservable(fromSource(input));
}


