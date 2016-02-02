
import {Observable} from '../../Observable';
import {distinctUntilChanged} from '../../operator/distinctUntilChanged';

Observable.prototype.distinctUntilChanged = distinctUntilChanged;

declare module '../../Observable' {
  interface Observable<T> {
    distinctUntilChanged: (compare?: (x: T, y: T) => boolean) => Observable<T>;
  }
}

export var _void: void;