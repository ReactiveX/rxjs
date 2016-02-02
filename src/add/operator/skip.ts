
import {Observable} from '../../Observable';
import {skip} from '../../operator/skip';

Observable.prototype.skip = skip;

declare module '../../Observable' {
  interface Observable<T> {
    skip: (count: number) => Observable<T>;
  }
}