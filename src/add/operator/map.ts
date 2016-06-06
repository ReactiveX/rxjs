
import {Observable} from '../../Observable';
import {map, MapSignature} from '../../operator/map';

Observable.prototype.map = map;

declare module '../../Observable' {
  interface IObservable<T> {
    map: MapSignature<T>;
  }
  interface Observable<T> {
    map: MapSignature<T>;
  }
}