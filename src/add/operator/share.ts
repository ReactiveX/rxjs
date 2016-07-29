
import {Observable} from '../../Observable';
import {share, ShareSignature} from '../../operator/share';

Observable.prototype.share = share;

declare module '../../Observable' {
  interface IObservable<T> {
    share: ShareSignature<T>;
  }
}