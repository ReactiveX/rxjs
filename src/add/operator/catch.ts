
import {Observable} from '../../Observable';
import {_catch} from '../../operator/catch';

Observable.prototype.catch = _catch;

declare module '../../Observable' {
  interface Observable<T> {
    catch: (selector: (err: any, source: Observable<T>, caught: Observable<any>) => Observable<any>) => Observable<T>;
  }
}

export var _void: void;