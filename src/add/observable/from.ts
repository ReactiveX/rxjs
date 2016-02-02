import {Observable} from '../../Observable';
import {FromObservable} from '../../observable/FromObservable';

Observable.from = FromObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let from: typeof FromObservable.create;
  }
}