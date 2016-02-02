import {Observable} from '../../Observable';
import {PromiseObservable} from '../../observable/PromiseObservable';

Observable.fromPromise = PromiseObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let fromPromise: typeof PromiseObservable.create;
  }
}