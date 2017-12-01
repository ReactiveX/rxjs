import { Observable } from '../../internal/Observable';
import { timer as staticTimer } from '../../internal/observable/timer';

Observable.timer = staticTimer;

declare module '../../internal/Observable' {
  namespace Observable {
    export let timer: typeof staticTimer;
  }
}
