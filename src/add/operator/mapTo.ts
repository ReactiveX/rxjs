
import {Observable} from '../../Observable';
import {mapTo, MapToSignature} from '../../operator/mapTo';

Observable.prototype.mapTo = mapTo;

declare module '../../Observable' {
  interface Observable<T> {
    mapTo: MapToSignature<T>;
  }
}