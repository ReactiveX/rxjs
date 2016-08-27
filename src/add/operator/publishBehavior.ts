
import { Observable } from '../../Observable';
import { publishBehavior, PublishBehaviorSignature } from '../../operator/publishBehavior';

Observable.prototype.publishBehavior = publishBehavior;

declare module '../../Observable' {
  interface Observable<T> {
    publishBehavior: PublishBehaviorSignature<T>;
  }
}