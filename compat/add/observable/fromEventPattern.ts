import { Observable, fromEventPattern as staticFromEventPattern } from 'rxjs';

Observable.fromEventPattern = staticFromEventPattern;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let fromEventPattern: typeof staticFromEventPattern;
  }
}
