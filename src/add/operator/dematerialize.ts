
import { Observable } from '../../internal/Observable';
import { dematerialize } from '../../internal/patching/operator/dematerialize';

Observable.prototype.dematerialize = dematerialize;

declare module '../../internal/Observable' {
  interface Observable<T> {
    dematerialize: typeof dematerialize;
  }
}
