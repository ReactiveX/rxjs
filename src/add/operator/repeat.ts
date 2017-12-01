
import { Observable } from '../../Observable';
import { repeat } from '../../internal/patching/operator/repeat';

Observable.prototype.repeat = repeat;

declare module '../../Observable' {
  interface Observable<T> {
    repeat: typeof repeat;
  }
}
