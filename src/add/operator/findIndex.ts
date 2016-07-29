
import {Observable} from '../../Observable';
import {findIndex, FindIndexSignature} from '../../operator/findIndex';

Observable.prototype.findIndex = findIndex;

declare module '../../Observable' {
  interface IObservable<T> {
    findIndex: FindIndexSignature<T>;
  }
}