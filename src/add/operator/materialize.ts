
import {Observable, IObservable} from '../../Observable';
import {materialize, MaterializeSignature} from '../../operator/materialize';

Observable.prototype.materialize = materialize;

declare module '../../Observable' {
  interface IObservable<T> {
    materialize: MaterializeSignature<T>;
  }
}