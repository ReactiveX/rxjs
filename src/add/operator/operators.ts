import { Observable } from '../../Observable';
import { operators } from '../../operator/operators';

Observable.prototype.operators = operators;

declare module '../../Observable' {
  interface Observable<T> {
    operators: typeof operators;
  }
}