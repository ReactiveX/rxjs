
import {Observable} from '../../Observable';
import {publish, PublishSignature} from '../../operator/publish';

Observable.prototype.publish = publish;

declare module '../../Observable' {
  interface Observable<T> {
    publish: PublishSignature<T>;
  }
}