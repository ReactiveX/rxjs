
import { Observable } from '../../Observable';
import { startWith, StartWithSignature } from '../../operator/startWith';

Observable.prototype.startWith = startWith;

declare module '../../Observable' {
  interface Observable<T> {
    startWith: StartWithSignature<T>;
  }
}