
import {Observable} from '../../Observable';
import {bufferCount} from '../../operator/bufferCount';

Observable.prototype.bufferCount = bufferCount;

declare module '../../Observable' {
  interface Observable<T> {
    bufferCount: (bufferSize: number, startBufferEvery: number) => Observable<T[]>;
  }
}

export var _void: void;