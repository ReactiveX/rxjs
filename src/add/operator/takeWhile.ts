
import {Observable} from '../../Observable';
import {takeWhile} from '../../operator/takeWhile';

Observable.prototype.takeWhile = takeWhile;

declare module '../../Observable' {
  interface Observable<T> {
    takeWhile: (predicate: (value: T, index: number) => boolean) => Observable<T>;
  }
}

export var _void: void;