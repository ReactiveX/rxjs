
import {Observable} from '../../Observable';
import {switchMap, SwitchMapSignature} from '../../operator/switchMap';

Observable.prototype.switchMap = switchMap;

declare module '../../Observable' {
  interface IObservable<T> {
    switchMap: SwitchMapSignature<T>;
  }
}