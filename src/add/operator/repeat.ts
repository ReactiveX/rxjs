
import { Observable } from '../../internal/Observable';
import { repeat } from '../../internal/patching/operator/repeat';

Observable.prototype.repeat = repeat;

declare module '../../internal/Observable' {
  interface Observable<T> {
    repeat: typeof repeat;
  }
}
