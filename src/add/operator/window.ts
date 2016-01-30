
import {Observable} from '../../Observable';
import {window} from '../../operator/window';

Observable.prototype.window = window;

declare module '../../Observable' {
  interface Observable<T> {
    window: (closingNotifier: Observable<any>) => Observable<Observable<T>>;
  }
}

export var _void: void;