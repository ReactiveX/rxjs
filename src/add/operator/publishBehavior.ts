
import { Observable } from '../../Observable';
import { publishBehavior } from '../../internal/patching/operator/publishBehavior';

Observable.prototype.publishBehavior = publishBehavior;

declare module '../../Observable' {
  interface Observable<T> {
    publishBehavior: typeof publishBehavior;
  }
}
