import { Observable } from '../../internal/Observable';
import { interval as staticInterval } from '../../internal/observable/interval';

Observable.interval = staticInterval;

declare module '../../internal/Observable' {
  namespace Observable {
    export let interval: typeof staticInterval;
  }
}
