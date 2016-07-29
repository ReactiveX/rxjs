
import {Observable} from '../../Observable';
import {dematerialize, DematerializeSignature} from '../../operator/dematerialize';

Observable.prototype.dematerialize = dematerialize;

declare module '../../Observable' {
  interface IObservable<T> {
    dematerialize: DematerializeSignature<T>;
  }
}