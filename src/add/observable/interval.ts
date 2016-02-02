import {Observable} from '../../Observable';
import {IntervalObservable} from '../../observable/IntervalObservable';

Observable.interval = IntervalObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let interval: typeof IntervalObservable.create;
  }
}