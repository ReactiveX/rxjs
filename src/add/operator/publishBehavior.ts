
import {Observable, IObservable} from '../../Observable';
import {publishBehavior, PublishBehaviorSignature} from '../../operator/publishBehavior';

Observable.prototype.publishBehavior = publishBehavior;

declare module '../../Observable' {
  interface IObservable<T> {
    publishBehavior: PublishBehaviorSignature<T>;
  }
}