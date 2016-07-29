
import {Observable, IObservable} from '../../Observable';
import {find, FindSignature} from '../../operator/find';

Observable.prototype.find = find;

declare module '../../Observable' {
  interface IObservable<T> {
    find: FindSignature<T>;
  }
}