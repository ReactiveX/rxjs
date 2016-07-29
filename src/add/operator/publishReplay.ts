
import {Observable, IObservable} from '../../Observable';
import {publishReplay, PublishReplaySignature} from '../../operator/publishReplay';

Observable.prototype.publishReplay = publishReplay;

declare module '../../Observable' {
  interface IObservable<T> {
    publishReplay: PublishReplaySignature<T>;
  }
}