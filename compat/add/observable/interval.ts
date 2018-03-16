import { Observable, interval as staticInterval } from 'rxjs';

Observable.interval = staticInterval;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let interval: typeof staticInterval;
  }
}
