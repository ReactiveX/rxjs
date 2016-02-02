import {Observable} from '../../Observable';
import {NeverObservable} from '../../observable/NeverObservable';

Observable.never = NeverObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let never: typeof NeverObservable.create;
  }
}