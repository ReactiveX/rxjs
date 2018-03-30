import { Observable, fromEvent as staticFromEvent } from 'rxjs';

Observable.fromEvent = staticFromEvent;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let fromEvent: typeof staticFromEvent;
  }
}
