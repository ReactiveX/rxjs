
import { Observable } from '../../internal/Observable';
import { publishBehavior } from '../../internal/patching/operator/publishBehavior';

Observable.prototype.publishBehavior = publishBehavior;

declare module '../../internal/Observable' {
  interface Observable<T> {
    publishBehavior: typeof publishBehavior;
  }
}
