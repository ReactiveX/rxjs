
import {Observable} from '../../Observable';
import {_catch, CatchSignature} from '../../operator/catch';

Observable.prototype.catch = _catch;

declare module '../../Observable' {
  interface IObservable<T> {
    catch: CatchSignature<T>;
  }
}