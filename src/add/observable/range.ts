import {Observable} from '../../Observable';
import {RangeObservable} from '../../observable/RangeObservable';

Observable.range = RangeObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let range: typeof RangeObservable.create;
  }
}