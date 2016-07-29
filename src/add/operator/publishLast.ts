
import {Observable, IObservable} from '../../Observable';
import {publishLast, PublishLastSignature} from '../../operator/publishLast';

Observable.prototype.publishLast = publishLast;

declare module '../../Observable' {
  interface IObservable<T> {
    publishLast: PublishLastSignature<T>;
  }
}