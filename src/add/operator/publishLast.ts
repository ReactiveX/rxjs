
import { Observable } from '../../Observable';
import { publishLast, PublishLastSignature } from '../../operator/publishLast';

Observable.prototype.publishLast = publishLast;

declare module '../../Observable' {
  interface Observable<T> {
    publishLast: PublishLastSignature<T>;
  }
}