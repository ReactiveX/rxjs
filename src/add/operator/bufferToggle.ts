
import {Observable} from '../../Observable';
import {bufferToggle} from '../../operator/bufferToggle';

Observable.prototype.bufferToggle = bufferToggle;

declare module '../../Observable' {
  interface Observable<T> {
    bufferToggle: <O>(openings: Observable<O>, closingSelector?: (openValue: O) => Observable<any>) => Observable<T[]>;
  }
}

export var _void: void;