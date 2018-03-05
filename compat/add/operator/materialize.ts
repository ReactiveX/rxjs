
import { Observable } from '../../internal/Observable';
import { materialize } from '../../internal/patching/operator/materialize';

Observable.prototype.materialize = materialize;

declare module '../../internal/Observable' {
  interface Observable<T> {
    materialize: typeof materialize;
  }
}
