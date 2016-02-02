import {Observable} from '../../Observable';
import {UsingObservable} from '../../observable/UsingObservable';

Observable.using = UsingObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let using: typeof UsingObservable.create;
  }
}