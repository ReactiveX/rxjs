import { Observable } from '../../Observable';
import { interval as staticInterval } from '../../internal/observable/interval';

Observable.interval = staticInterval;

declare module '../../Observable' {
  namespace Observable {
    export let interval: typeof staticInterval;
  }
}
