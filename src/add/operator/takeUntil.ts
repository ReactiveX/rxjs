
import {Observable} from '../../Observable';
import {takeUntil} from '../../operator/takeUntil';

Observable.prototype.takeUntil = takeUntil;

declare module '../../Observable' {
  interface Observable<T> {
    takeUntil: (notifier: Observable<any>) => Observable<T>;
  }
}

export var _void: void;