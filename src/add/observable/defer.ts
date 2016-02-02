import {Observable} from '../../Observable';
import {DeferObservable} from '../../observable/DeferObservable';

Observable.defer = DeferObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let defer: typeof DeferObservable.create;
  }
}