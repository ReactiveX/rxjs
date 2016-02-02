
import {Observable} from '../../Observable';
import {windowCount} from '../../operator/windowCount';

Observable.prototype.windowCount = windowCount;

declare module '../../Observable' {
  interface Observable<T> {
    windowCount: (windowSize: number, startWindowEvery: number) => Observable<Observable<T>>;
  }
}