
import {Observable} from '../../Observable';
import {toPromise, ToPromiseSignature} from '../../operator/toPromise';

Observable.prototype.toPromise = toPromise;

declare module '../../Observable' {
  interface IObservable<T> {
    toPromise: ToPromiseSignature<T>;
  }
}