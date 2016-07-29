
import {Observable, IObservable} from '../../Observable';
import {skip, SkipSignature} from '../../operator/skip';

Observable.prototype.skip = skip;

declare module '../../Observable' {
  interface IObservable<T> {
    skip: SkipSignature<T>;
  }
}