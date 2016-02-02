
import {Observable} from '../../Observable';
import {merge} from '../../operator/merge';

Observable.prototype.merge = merge;

declare module '../../Observable' {
  interface Observable<T> {
    merge: (...observables: any[]) => Observable<any>;
  }
}