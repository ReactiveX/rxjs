import {Observable} from '../../Observable';
import {FromEventObservable} from '../../observable/FromEventObservable';

Observable.fromEvent = FromEventObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let fromEvent: typeof FromEventObservable.create;
  }
}