
import {Observable} from '../../Observable';
import {ConnectableObservable} from '../../observable/ConnectableObservable';
import {publish} from '../../operator/publish';

Observable.prototype.publish = publish;

declare module '../../Observable' {
  interface Observable<T> {
    publish: () => ConnectableObservable<T>;
  }
}