import {Observable} from '../../Observable';
import {TimerObservable} from '../../observable/TimerObservable';

Observable.timer = TimerObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let timer: typeof TimerObservable.create;
  }
}