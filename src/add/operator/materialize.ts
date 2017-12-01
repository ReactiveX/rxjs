
import { Observable } from '../../Observable';
import { materialize } from '../../internal/patching/operator/materialize';

Observable.prototype.materialize = materialize;

declare module '../../Observable' {
  interface Observable<T> {
    materialize: typeof materialize;
  }
}
