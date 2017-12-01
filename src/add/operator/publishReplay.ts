
import { Observable } from '../../internal/Observable';
import { publishReplay } from '../../internal/patching/operator/publishReplay';

Observable.prototype.publishReplay = publishReplay;

declare module '../../internal/Observable' {
  interface Observable<T> {
    publishReplay: typeof publishReplay;
  }
}
