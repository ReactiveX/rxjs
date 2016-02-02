import {Observable} from '../../Observable';
import {ArrayObservable} from '../../observable/ArrayObservable';

Observable.of = ArrayObservable.of;

declare module '../../Observable' {
  namespace Observable {
    export let of: typeof ArrayObservable.of;
  }
}