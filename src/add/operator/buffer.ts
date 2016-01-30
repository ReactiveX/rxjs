
import {Observable} from '../../Observable';
import {buffer} from '../../operator/buffer';

Observable.prototype.buffer = buffer;

declare module '../../Observable' {
  interface Observable<T> {
    buffer: (closingNotifier: Observable<any>) => Observable<T[]>;
  }
}

export var _void: void;