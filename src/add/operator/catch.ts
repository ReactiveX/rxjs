
import { Observable } from '../../Observable';
import { _catch, CatchSignature } from '../../operator/catch';

Observable.prototype.catch = _catch;
Observable.prototype._catch = _catch;

declare module '../../Observable' {
  interface Observable<T> {
    catch: CatchSignature<T>;
    _catch: CatchSignature<T>;
  }
}