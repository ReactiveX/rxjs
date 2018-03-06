import { Observable, timer as staticTimer } from 'rxjs';

Observable.timer = staticTimer;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let timer: typeof staticTimer;
  }
}
