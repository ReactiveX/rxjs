import {Observable} from '../../Observable';
import {ForkJoinObservable} from '../../observable/ForkJoinObservable';

Observable.forkJoin = ForkJoinObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let forkJoin: typeof ForkJoinObservable.create;
  }
}