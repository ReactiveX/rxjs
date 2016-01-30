
import {Observable} from '../../Observable';
import {publishReplay, PublishReplaySignature} from '../../operator/publishReplay';

Observable.prototype.publishReplay = publishReplay;

declare module '../../Observable' {
  interface Observable<T> {
    publishReplay: PublishReplaySignature<T>;
  }
}