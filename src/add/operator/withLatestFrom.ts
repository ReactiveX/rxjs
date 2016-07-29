
import {Observable} from '../../Observable';
import {withLatestFrom, WithLatestFromSignature} from '../../operator/withLatestFrom';

Observable.prototype.withLatestFrom = withLatestFrom;

declare module '../../Observable' {
  interface IObservable<T> {
    withLatestFrom: WithLatestFromSignature<T>;
  }
}