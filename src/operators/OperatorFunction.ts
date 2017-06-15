import { Observable } from '../Observable';

export interface OperatorFunction<T, R> {
  (source: Observable<T>): Observable<R>;
}
