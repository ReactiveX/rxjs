
import { Observable } from '../../Observable';
import { dematerialize } from '../../internal/patching/operator/dematerialize';

Observable.prototype.dematerialize = dematerialize;

declare module '../../Observable' {
  interface Observable<T> {
    dematerialize: typeof dematerialize;
  }
}
