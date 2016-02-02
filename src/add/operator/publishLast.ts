
import {Observable} from '../../Observable';
import {ConnectableObservable} from '../../observable/ConnectableObservable';
import {publishLast} from '../../operator/publishLast';

Observable.prototype.publishLast = publishLast;

declare module '../../Observable' {
  interface Observable<T> {
    publishLast: () => ConnectableObservable<T>;
  }
}

export var _void: void;