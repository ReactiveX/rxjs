
import {Observable, IObservable} from '../../Observable';
import {startWith, StartWithSignature} from '../../operator/startWith';

Observable.prototype.startWith = startWith;

declare module '../../Observable' {
  interface IObservable<T> {
    startWith: StartWithSignature<T>;
  }
}