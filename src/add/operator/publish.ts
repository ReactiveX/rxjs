
import { Observable } from '../../internal/Observable';
import { publish } from '../../internal/patching/operator/publish';

Observable.prototype.publish = <any>publish;

declare module '../../internal/Observable' {
  interface Observable<T> {
    publish: typeof publish;
  }
}
