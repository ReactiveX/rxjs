
import { Observable } from '../../Observable';
import { materialize, MaterializeSignature } from '../../operator/materialize';

Observable.prototype.materialize = materialize;

declare module '../../Observable' {
  interface Observable<T> {
    materialize: MaterializeSignature<T>;
  }
}