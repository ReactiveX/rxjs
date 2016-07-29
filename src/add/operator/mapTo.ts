
import {Observable} from '../../Observable';
import {mapTo, MapToSignature} from '../../operator/mapTo';

Observable.prototype.mapTo = mapTo;

declare module '../../Observable' {
  interface IObservable<T> {
    mapTo: MapToSignature<T>;
  }
}