import {Observable} from '../../Observable';
import {EmptyObservable} from '../../observable/EmptyObservable';

Observable.empty = EmptyObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let empty: typeof EmptyObservable.create;
  }
}