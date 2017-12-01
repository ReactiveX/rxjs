
import { Observable } from '../../Observable';
import { publishReplay } from '../../internal/patching/operator/publishReplay';

Observable.prototype.publishReplay = publishReplay;

declare module '../../Observable' {
  interface Observable<T> {
    publishReplay: typeof publishReplay;
  }
}
