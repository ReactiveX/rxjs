
import {Observable} from '../../Observable';
import {windowToggle} from '../../operator/windowToggle';

Observable.prototype.windowToggle = windowToggle;

declare module '../../Observable' {
  interface Observable<T> {
    windowToggle: <O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<Observable<T>>;
  }
}

export var _void: void;