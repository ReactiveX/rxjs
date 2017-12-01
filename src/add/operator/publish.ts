
import { Observable } from '../../Observable';
import { publish } from '../../internal/patching/operator/publish';

Observable.prototype.publish = <any>publish;

declare module '../../Observable' {
  interface Observable<T> {
    publish: typeof publish;
  }
}
